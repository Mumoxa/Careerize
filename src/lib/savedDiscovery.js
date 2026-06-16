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

function buildSession(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email,
    provider: "supabase",
  };
}

async function upsertLearnerProfile(supabase, session, profile = {}) {
  const learnerProfile = {
    email: session.email,
    name: profile.name || session.name || session.email,
    last_best_match: profile.bestMatch ?? null,
    last_progress: profile.progress ?? 0,
    last_saved_at: profile.savedAt ?? new Date().toISOString(),
  };

  const { error } = await supabase
    .from("careerize_profiles")
    .upsert(
      {
        user_id: session.id,
        profile: learnerProfile,
      },
      { onConflict: "user_id" }
    );

  if (error) throw error;
  return learnerProfile;
}

export async function getCurrentSession() {
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const user = data.session?.user;
    return user ? buildSession(user) : null;
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
      const session = buildSession(data.user);
      await upsertLearnerProfile(supabase, session, { name });
      return session;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name } },
    });

    if (signUpError) throw signUpError;
    if (!signUpData.session) {
      throw new Error("Account created. Please confirm the email address, then log in to save your Careerize view.");
    }

    const session = signUpData.user ? buildSession(signUpData.user) : null;
    if (session) await upsertLearnerProfile(supabase, session, { name });
    return session;
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

export async function loadSavedDiscovery(session) {
  if (!session) return null;
  const supabase = await getSupabaseClient();

  if (supabase && session.provider === "supabase") {
    const { data, error } = await supabase
      .from("careerize_results")
      .select("answers, selected_signals, ranked_results, best_match, personal_record, updated_at")
      .eq("user_id", session.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  try {
    return JSON.parse(window.localStorage.getItem(localRecordKey(session.email)) ?? "null");
  } catch {
    return null;
  }
}

export async function saveDiscovery(session, discovery) {
  if (!session) throw new Error("Sign in before saving your discovery view.");
  const supabase = await getSupabaseClient();

  const record = {
    answers: discovery.answers,
    selected_signals: discovery.selectedSignals,
    ranked_results: discovery.rankedResults,
    best_match: discovery.bestMatch,
    personal_record: discovery.personalRecord ?? {},
    updated_at: new Date().toISOString(),
  };

  const profileSnapshot = {
    email: session.email,
    name: session.name || session.email,
    best_match: discovery.bestMatch,
    match_percent: discovery.matchPercent,
    progress: discovery.progress,
    saved_at: record.updated_at,
  };

  if (supabase && session.provider === "supabase") {
    await upsertLearnerProfile(supabase, session, {
      bestMatch: discovery.bestMatch,
      progress: discovery.progress,
      savedAt: record.updated_at,
    });

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
      profile_snapshot: profileSnapshot,
      answers: record.answers,
      selected_signals: record.selected_signals,
      ranked_results: record.ranked_results,
      best_match: record.best_match,
      personal_record: record.personal_record,
      match_percent: discovery.matchPercent,
      assessment_version: "v1.1",
    });
    if (sessionError) throw sessionError;

    return record;
  }

  window.localStorage.setItem(localRecordKey(session.email), JSON.stringify({ ...record, profile_snapshot: profileSnapshot }));
  return record;
}
