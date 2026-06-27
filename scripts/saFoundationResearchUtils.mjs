import fs from "node:fs";

const TITLE_STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "services",
  "service",
  "assistant",
  "officer",
  "manager",
  "senior",
  "junior",
  "specialist",
  "professional",
  "practitioner",
  "worker",
  "operator",
  "supervisor",
  "associate",
  "administrator",
  "consultant",
  "executive",
  "lead",
  "trainee",
  "intern",
  "general",
  "public",
  "corporate",
  "support",
]);

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === "\"") {
        if (text[index + 1] === "\"") {
          value += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += character;
      }
      continue;
    }

    if (character === "\"") {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  const [header = [], ...dataRows] = rows;

  return dataRows
    .filter((currentRow) => currentRow.length > 0 && currentRow.some((cell) => String(cell ?? "").trim() !== ""))
    .map((currentRow) => Object.fromEntries(header.map((column, columnIndex) => [column, currentRow[columnIndex] ?? ""])));
}

export function readCsv(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

export function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, "\"\"")}"`;
}

export function writeCsv(filePath, rows, columns) {
  const header = columns ?? Array.from(
    rows.reduce((columnSet, row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
      return columnSet;
    }, new Set())
  );

  const lines = [
    header.map(csvEscape).join(","),
    ...rows.map((row) => header.map((column) => csvEscape(row[column] ?? "")).join(",")),
  ];

  const tempPath = `${filePath}.tmp`;
  const content = `${lines.join("\n")}\n`;
  fs.writeFileSync(tempPath, content);
  try {
    fs.renameSync(tempPath, filePath);
  } catch {
    fs.writeFileSync(filePath, content);
    fs.unlinkSync(tempPath);
  }
}

export function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTitle(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bca\(sa\)\b/g, " ca sa ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value) {
  return normalizeTitle(value).replace(/\s+/g, "-");
}

export function splitList(value) {
  return normalizeWhitespace(value)
    .split(/\s*(?:;|\|)\s*/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

export function uniqueValues(values) {
  const seen = new Set();
  const unique = [];

  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

export function joinUnique(values) {
  return uniqueValues(values).join(" | ");
}

export function parseScore(value) {
  const score = Number.parseFloat(String(value ?? "").trim());
  return Number.isFinite(score) ? score : null;
}

export function countNonEmptyFields(record, fields) {
  return fields.reduce((count, field) => count + (normalizeWhitespace(record[field]).length > 0 ? 1 : 0), 0);
}

function simplifyToken(token) {
  let current = token;

  for (const suffix of ["ments", "ment", "ings", "ing", "ers", "er", "ors", "or", "ists", "ist", "ians", "ian", "ics", "ic", "ies", "s"]) {
    if (current.length >= 6 && current.endsWith(suffix)) {
      current = current.slice(0, -suffix.length);
      break;
    }
  }

  return current;
}

export function titleTokens(value) {
  return uniqueValues(
    normalizeTitle(value)
      .split(" ")
      .map((token) => simplifyToken(token))
      .filter((token) => token.length >= 3 && !TITLE_STOPWORDS.has(token))
  );
}

function tokenMatches(left, right) {
  return left === right || left.startsWith(right) || right.startsWith(left);
}

export function tokenOverlapStats(leftValue, rightValue) {
  const leftTokens = titleTokens(leftValue);
  const rightTokens = titleTokens(rightValue);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return { score: 0, matches: 0 };
  }

  let matches = 0;
  for (const leftToken of leftTokens) {
    if (rightTokens.some((rightToken) => tokenMatches(leftToken, rightToken))) {
      matches += 1;
    }
  }

  return {
    score: matches / Math.max(leftTokens.length, rightTokens.length),
    matches,
  };
}
