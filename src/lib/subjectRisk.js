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
      label: "Subject risk unknown",
      summary: "No subject pathway is available for this career yet.",
      matched: [],
      missing: [],
      nextStep: "Compare this route with at least two alternatives and verify requirements with a provider.",
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
      label: "Add subjects to check risk",
      summary: "Careerize needs the learner's current or planned subjects before it can flag route risk.",
      matched,
      missing: required,
      nextStep: "Add Grade, Mathematics choice and current/planned subjects in the learner profile panel.",
    };
  }

  if (missing.length === 0) {
    return {
      level: "green",
      label: "Route appears open",
      summary: "The learner's captured subjects cover the strongest template subject signals for this route.",
      matched,
      missing,
      nextStep: "Keep marks strong and verify exact provider APS, subject percentages and accreditation before applying.",
    };
  }

  if (missing.length < required.length) {
    return {
      level: "amber",
      label: "Route may narrow",
      summary: "Some important template subjects are missing, so the learner should check alternatives before final subject choices.",
      matched,
      missing,
      nextStep: `Discuss whether ${missing.slice(0, 2).join(" and ")} should be added, kept or verified with a teacher/advisor.`,
    };
  }

  return {
    level: "red",
    label: "Major subject gate risk",
    summary: "The captured subjects do not cover the strongest template subject signals for this route.",
    matched,
    missing,
    nextStep: `Before committing to this route, verify whether ${missing.slice(0, 2).join(" and ")} are required or whether TVET/workplace alternatives are more realistic.`,
  };
}
