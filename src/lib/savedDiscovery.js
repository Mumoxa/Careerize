const LOCAL_SESSION_KEY = "careerize.localSession";
const LOCAL_RECORD_PREFIX = "careerize.discovery.";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClientPromise = null;

async function getSupabaseClient() {
  if (!hasSupabaseConfig) return null;

  if (!supabaseClientPromise) {
    supabaseClientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey)
    );
  }

  return supabaseClientPromise;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function localRecordKey(email) {
  return `${LOCAL_RECORD_PREFIX}${normalizeEmail(email)}`;
}

function readLocalRecord(email) {
  try {
    return JSON.parse(window.localStorage.getItem(localRecordKey(email)) ?? "null");
  } catch {
    return null;
  }
}

function writeLocalRecord(email, record) {
  window.localStorage.setItem(localRecordKey(email), JSON.stringify(record));
}

function getLocalSession() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}

function setLocalSession(session) {
  window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

function clearLocalSession() {
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
}

function cleanProfile(profile = {}) {
  return {
    preferredName: String(profile.preferredName ?? "").trim(),
    stage: String(profile.stage ?? "").trim(),
    location: String(profile.location ?? "").trim(),
    subjects: String(profile.subjects ?? "").trim(),
    currentSubjects: Array.isArray(profile.currentSubjects) ? profile.currentSubjects.map((item) => String(item).trim()).filter(Boolean) : [],
    mathsChoice: String(profile.mathsChoice ?? "").trim(),
    marksBand: String(profile.marksBand ?? "").trim(),
    notes: String(profile.notes ?? "").trim(),
  };
}

export async function getCurrentSession() {
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const user = data.session?.user;
    return user ? { id: user.id, email: user.email, provider: "supabase" } : null;
  }

  return getLocalSession();
}

export async function signInOrCreateLearner({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!error && data.user) {
      return { id: data.user.id, email: data.user.email, provider: "supabase" };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name?.trim() || normalizedEmail } },
    });

    if (signUpError) throw signUpError;

    if (!signUpData.user) {
      throw new Error("Check your inbox to confirm your email, then log in again.");
    }

    return { id: signUpData.user.id, email: signUpData.user.email, provider: "supabase" };
  }

  const session = {
    id: normalizedEmail,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail,
    provider: "local",
  };
  setLocalSession(session);
  return session;
}

export async function signOutLearner() {
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  clearLocalSession();
}

export async function loadLearnerProfile(session) {
  if (!session) return null;
  const supabase = await getSupabaseClient();

  if (supabase && session.provider === "supabase") {
    const { data, error } = await supabase
      .from("careerize_profiles")
      .select("profile, updated_at")
      .eq("user_id", session.id)
      .maybeSingle();

    if (error) throw error;
    return data?.profile ? { ...data.profile, updated_at: data.updated_at } : null;
  }

  const stored = readLocalRecord(session.email);
  return stored?.profile ?? null;
}

export async function loadSavedDiscovery(session) {
  if (!session) return null;
  const supabase = await getSupabaseClient();

  if (supabase && session.provider === "supabase") {
    const { data, error } = await supabase
      .from("careerize_results")
      .select("answers, selected_signals, ranked_results, best_match, updated_at")
      .eq("user_id", session.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  const stored = readLocalRecord(session.email);
  return stored?.discovery ?? stored ?? null;
}

export async function saveDiscovery(session, discovery) {
  if (!session) throw new Error("Sign in before saving your discovery view.");
  const supabase = await getSupabaseClient();
  const profile = cleanProfile(discovery.profile);

  const record = {
    answers: discovery.answers,
    selected_signals: discovery.selectedSignals,
    ranked_results: discovery.rankedResults,
    best_match: discovery.bestMatch,
    updated_at: new Date().toISOString(),
  };

  if (supabase && session.provider === "supabase") {
    const { error: profileError } = await supabase
      .from("careerize_profiles")
      .upsert(
        {
          user_id: session.id,
          profile,
          updated_at: record.updated_at,
        },
        { onConflict: "user_id" }
      );
    if (profileError) throw profileError;

    const { error: resultError } = await supabase
      .from("careerize_results")
      .upsert(
        {
          user_id: session.id,
          ...record,
        },
        { onConflict: "user_id" }
      );
    if (resultError) throw resultError;

    const { error: sessionError } = await supabase.from("careerize_discovery_sessions").insert({
      user_id: session.id,
      profile_snapshot: profile,
      answers: record.answers,
      selected_signals: record.selected_signals,
      ranked_results: record.ranked_results,
      best_match: record.best_match,
      match_percent: discovery.matchPercent,
      assessment_version: "v1.3",
    });
    if (sessionError) throw sessionError;

    return record;
  }

  writeLocalRecord(session.email, {
    profile,
    discovery: record,
  });
  return record;
}


export async function exportLearnerData(session) {
  if (!session) throw new Error("Sign in before exporting your learner data.");
  const [profile, discovery] = await Promise.all([
    loadLearnerProfile(session),
    loadSavedDiscovery(session),
  ]);

  return {
    exported_at: new Date().toISOString(),
    session: { email: session.email, provider: session.provider },
    profile,
    discovery,
  };
}

export async function deleteLearnerData(session) {
  if (!session) throw new Error("Sign in before deleting your learner data.");
  const supabase = await getSupabaseClient();

  if (supabase && session.provider === "supabase") {
    const tables = ["careerize_discovery_sessions", "careerize_results", "careerize_profiles"];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", session.id);
      if (error) throw error;
    }
    await signOutLearner();
    return { deleted: true, provider: "supabase" };
  }

  window.localStorage.removeItem(localRecordKey(session.email));
  clearLocalSession();
  return { deleted: true, provider: "local" };
}
