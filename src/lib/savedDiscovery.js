const LOCAL_SESSION_KEY = "careerize.localSession";
const LOCAL_RECORD_PREFIX = "careerize.discovery.";
const COMPACT_RESULT_LIMIT = 10;

const runtimeEnv = import.meta.env ?? {};
const supabaseUrl = runtimeEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = runtimeEnv.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const isLocalDemoMode = !hasSupabaseConfig && Boolean(runtimeEnv.DEV);
export const learnerPersistenceMode = hasSupabaseConfig
  ? "supabase"
  : isLocalDemoMode
    ? "local-demo"
    : "unavailable";
export const canPersistLearnerData = hasSupabaseConfig || isLocalDemoMode;

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

function assertLocalDemoSession(session) {
  if (!isLocalDemoMode || session?.provider !== "local") {
    throw new Error("Saved learner profiles are unavailable in this deployment.");
  }
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

function compactMatchedSignals(matchedSignals) {
  if (!Array.isArray(matchedSignals)) return [];
  return matchedSignals
    .map((item) => (typeof item === "string" ? item : item?.signal))
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function compactResult(route = {}) {
  return {
    id: String(route.id ?? "").trim(),
    title: String(route.title ?? "").trim(),
    stream: String(route.stream ?? "").trim(),
    score: Number.isFinite(route.score) ? route.score : 0,
    match_percent: Number.isFinite(route.matchPercent) ? route.matchPercent : 0,
    matched_signals: compactMatchedSignals(route.explanation?.matchedSignals),
  };
}

export function compactRankedResults(rankedResults = [], bestMatch = null) {
  if (!Array.isArray(rankedResults)) return [];

  const compact = rankedResults.slice(0, COMPACT_RESULT_LIMIT).map(compactResult);
  const selectedRoute = bestMatch
    ? rankedResults.find((route) => route?.id === bestMatch)
    : null;

  if (selectedRoute && !compact.some((route) => route.id === bestMatch)) {
    compact.push(compactResult(selectedRoute));
  }

  return compact.filter((route) => route.id);
}

function makeHistoryRecord(profile, record, discovery) {
  return {
    profile_snapshot: profile,
    answers: record.answers,
    selected_signals: record.selected_signals,
    ranked_results: record.ranked_results,
    best_match: record.best_match,
    match_percent: Number.isFinite(discovery.matchPercent) ? discovery.matchPercent : null,
    assessment_version: "v1.3",
    created_at: record.updated_at,
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

  return isLocalDemoMode ? getLocalSession() : null;
}

export async function signInOrCreateLearner({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!error && data.session?.user) {
      const user = data.session.user;
      return { id: user.id, email: user.email, provider: "supabase" };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name?.trim() || normalizedEmail } },
    });

    if (signUpError) throw signUpError;

    if (!signUpData.session?.user) {
      throw new Error("Check your inbox to confirm your email. This browser is not signed in until confirmation is complete.");
    }

    const user = signUpData.session.user;
    return { id: user.id, email: user.email, provider: "supabase" };
  }

  if (!isLocalDemoMode) {
    throw new Error("Saved learner profiles are unavailable in this deployment. You can continue exploring without an account.");
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

  if (isLocalDemoMode) clearLocalSession();
}

export async function loadLearnerProfile(session) {
  if (!session) return null;
  const supabase = await getSupabaseClient();

  if (session.provider === "supabase") {
    if (!supabase) throw new Error("Supabase learner persistence is not configured.");
    const { data, error } = await supabase
      .from("careerize_profiles")
      .select("profile, created_at, updated_at")
      .eq("user_id", session.id)
      .maybeSingle();

    if (error) throw error;
    return data?.profile
      ? { ...data.profile, created_at: data.created_at, updated_at: data.updated_at }
      : null;
  }

  assertLocalDemoSession(session);
  return readLocalRecord(session.email)?.profile ?? null;
}

export async function loadSavedDiscovery(session) {
  if (!session) return null;
  const supabase = await getSupabaseClient();

  if (session.provider === "supabase") {
    if (!supabase) throw new Error("Supabase learner persistence is not configured.");
    const { data, error } = await supabase
      .from("careerize_results")
      .select("answers, selected_signals, ranked_results, best_match, created_at, updated_at")
      .eq("user_id", session.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  assertLocalDemoSession(session);
  const stored = readLocalRecord(session.email);
  return stored?.discovery ?? (stored?.answers ? stored : null);
}

export async function loadDiscoveryHistory(session) {
  if (!session) return [];
  const supabase = await getSupabaseClient();

  if (session.provider === "supabase") {
    if (!supabase) throw new Error("Supabase learner persistence is not configured.");
    const { data, error } = await supabase
      .from("careerize_discovery_sessions")
      .select("id, profile_snapshot, answers, selected_signals, ranked_results, best_match, match_percent, assessment_version, created_at")
      .eq("user_id", session.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  assertLocalDemoSession(session);
  const history = readLocalRecord(session.email)?.history;
  return Array.isArray(history) ? history : [];
}

export async function saveDiscovery(session, discovery) {
  if (!session) throw new Error("Sign in before saving your discovery view.");
  const supabase = await getSupabaseClient();
  const profile = cleanProfile(discovery.profile);

  const record = {
    answers: discovery.answers,
    selected_signals: discovery.selectedSignals,
    ranked_results: compactRankedResults(discovery.rankedResults, discovery.bestMatch),
    best_match: discovery.bestMatch,
    updated_at: new Date().toISOString(),
  };
  const historyRecord = makeHistoryRecord(profile, record, discovery);

  if (session.provider === "supabase") {
    if (!supabase) throw new Error("Supabase learner persistence is not configured.");
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
      ...historyRecord,
    });
    if (sessionError) throw sessionError;

    return record;
  }

  assertLocalDemoSession(session);
  const previousRecord = readLocalRecord(session.email);
  const history = Array.isArray(previousRecord?.history) ? previousRecord.history : [];
  writeLocalRecord(session.email, {
    profile,
    discovery: record,
    history: [...history, historyRecord],
  });
  return record;
}


export async function exportLearnerData(session) {
  if (!session) throw new Error("Sign in before exporting your learner data.");
  const [profile, discovery, discoveryHistory] = await Promise.all([
    loadLearnerProfile(session),
    loadSavedDiscovery(session),
    loadDiscoveryHistory(session),
  ]);

  return {
    exported_at: new Date().toISOString(),
    session: { email: session.email, provider: session.provider },
    profile,
    discovery,
    discovery_history: discoveryHistory,
  };
}

export async function deleteLearnerData(session) {
  if (!session) throw new Error("Sign in before deleting your learner data.");
  const supabase = await getSupabaseClient();

  if (session.provider === "supabase") {
    if (!supabase) throw new Error("Supabase learner persistence is not configured.");
    const tables = ["careerize_discovery_sessions", "careerize_results", "careerize_profiles"];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", session.id);
      if (error) throw error;
    }

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.id);
      if (error) throw error;
      if (count !== 0) throw new Error(`Saved learner data could not be deleted from ${table}.`);
    }

    await signOutLearner();
    return {
      deleted: true,
      provider: "supabase",
      deleted_scope: ["profile", "latest_discovery", "discovery_history"],
      auth_account_deleted: false,
    };
  }

  assertLocalDemoSession(session);
  window.localStorage.removeItem(localRecordKey(session.email));
  clearLocalSession();
  return {
    deleted: true,
    provider: "local",
    deleted_scope: ["profile", "latest_discovery", "discovery_history", "local_session"],
    auth_account_deleted: false,
  };
}
