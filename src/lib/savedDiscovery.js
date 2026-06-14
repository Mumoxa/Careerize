export const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function getCurrentSession() {
  return null;
}

export async function signInOrCreateLearner() {
  throw new Error("Saved learner profiles are not configured yet.");
}

export async function signOutLearner() {
  return null;
}

export async function loadLearnerProfile() {
  return null;
}

export async function loadSavedDiscovery() {
  return null;
}

export async function saveDiscovery() {
  throw new Error("Saved learner profiles are not configured yet.");
}
