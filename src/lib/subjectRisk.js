const SUBJECT_ALIASES = {
  maths: "Mathematics",
  math: "Mathematics",
  mathematics: "Mathematics",
  "mathematical literacy": "Mathematical Literacy",
  mathslit: "Mathematical Literacy",
  "physical science": "Physical Sciences",
  "physical sciences": "Physical Sciences",
  physics: "Physical Sciences",
  "life science": "Life Sciences",
  "life sciences": "Life Sciences",
  biology: "Life Sciences",
  accounting: "Accounting",
  cat: "Computer Applications Technology",
  it: "Information Technology",
  egd: "Engineering Graphics and Design",
};

const SUBJECT_KEYWORDS = {
  Mathematics: ["mathematics", "maths", "technical mathematics"],
  "Mathematical Literacy": ["mathematical literacy", "maths literacy"],
  "Physical Sciences": ["physical sciences", "physical science", "technical sciences", "physics"],
  "Life Sciences": ["life sciences", "life science", "biology"],
  Accounting: ["accounting"],
  "Information Technology": ["information technology", " it ", "coding", "programming"],
  "Computer Applications Technology": ["computer applications technology", "cat", "computer"],
  "Engineering Graphics and Design": ["engineering graphics and design", "egd", "technical drawing"],
  "Business Studies": ["business studies", "business"],
  Economics: ["economics"],
  Geography: ["geography"],
  "Agricultural Sciences": ["agricultural sciences", "agriculture"],
  English: ["english", "language"],
  History: ["history"],
  Tourism: ["tourism"],
  "Hospitality Studies": ["hospitality studies", "hospitality"],
  "Visual Arts": ["visual arts", "art"],
  Design: ["design"],
};

function normalizeToken(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function parseSubjects(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value ?? "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function canonicalSubject(value) {
  const normalized = normalizeToken(value);
  return SUBJECT_ALIASES[normalized] ?? String(value ?? "").trim();
}

export function learnerSubjectSet(profile = {}) {
  const rawSubjects = [
    ...parseSubjects(profile.subjects),
    ...parseSubjects(profile.currentSubjects),
    profile.mathsChoice,
  ].filter(Boolean);

  return new Set(rawSubjects.map(canonicalSubject).filter(Boolean));
}

function requirementCovered(requirement, selectedSubjects) {
  const text = ` ${normalizeToken(requirement)} `;

  for (const subject of selectedSubjects) {
    const canonical = canonicalSubject(subject);
    const keywords = SUBJECT_KEYWORDS[canonical] ?? [canonical.toLowerCase()];
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) return true;
  }

  return false;
}

export function assessSubjectRisk(pathway, profile = {}) {
  if (!pathway?.grade10Subjects) {
    return {
      level: "unknown",
      label: "Subject guidance unavailable",
      summary: "No starter subject template is available for this career yet.",
      matched: [],
      missing: [],
      nextStep: "Compare this route with alternatives and verify subject and entry requirements with each provider.",
    };
  }

  const selectedSubjects = [...learnerSubjectSet(profile)];
  const required = pathway.grade10Subjects.requiredOrStronglyRecommended ?? [];
  const recommended = pathway.grade10Subjects.recommended ?? [];
  const missing = required.filter((item) => !requirementCovered(item, selectedSubjects));
  const matched = [...required, ...recommended].filter((item) => requirementCovered(item, selectedSubjects));

  if (selectedSubjects.length === 0) {
    return {
      level: "unknown",
      label: "Add subjects for a template check",
      summary: "Add current or planned subjects to compare them with this starter template. This does not check provider admission requirements.",
      matched,
      missing: required,
      nextStep: "Add a Mathematics choice and current or planned subjects before comparing the template.",
    };
  }

  if (missing.length === 0) {
    return {
      level: "green",
      label: "No template subject gap found",
      summary: "The selected subjects overlap with the strongest signals in this starter template. Careerize has not checked provider admission requirements.",
      matched,
      missing,
      nextStep: "Requirements vary by provider. Verify exact subjects, marks, APS, accreditation and availability before applying or making subject choices.",
    };
  }

  if (missing.length < required.length) {
    return {
      level: "amber",
      label: "Some template subject signals are missing",
      summary: "The selected subjects match part of this starter template. Missing signals are prompts for provider checks, not an admission decision.",
      matched,
      missing,
      nextStep: `Ask a teacher or advisor about ${missing.slice(0, 2).join(" and ")}, then verify exact requirements with each provider.`,
    };
  }

  return {
    level: "red",
    label: "Provider check needed before subject decisions",
    summary: "The selected subjects do not match the strongest signals in this starter template. This does not determine admission eligibility.",
    matched,
    missing,
    nextStep: `Before changing subjects or choosing this route, ask a teacher or advisor about ${missing.slice(0, 2).join(" and ")} and verify alternatives with each provider.`,
  };
}
