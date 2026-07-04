import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog";
import { DEFAULT_LIFESTYLE_PREFERENCES, PREFERENCE_DEFINITIONS, rankCareerRoutes } from "./lib/scoring";

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "Accounting",
  "Business Studies",
  "Economics",
  "Geography",
  "Information Technology",
  "Computer Applications Technology",
  "Engineering Graphics and Design",
  "Agricultural Sciences",
  "Tourism",
  "Hospitality Studies",
  "Visual Arts",
  "Design",
];

async function renderApp() {
  render(<App />);
  await screen.findByRole("heading", { name: /search a career, or explore the word graph/i });
}

function byDataset(testId, field, value) {
  const match = [...document.querySelectorAll(`[data-testid="${testId}"]`)].find((element) => element.dataset[field] === value);
  expect(match, `${testId} ${field}=${value} should be rendered`).toBeTruthy();
  return match;
}

function discoveryOption(questionId, optionValue) {
  const match = [...document.querySelectorAll('[data-testid="discovery-option"]')]
    .find((element) => element.dataset.questionId === questionId && element.dataset.optionValue === optionValue);
  expect(match, `${questionId}:${optionValue} should be rendered`).toBeTruthy();
  return match;
}

function interestSignal(signalValue) {
  return byDataset("interest-signal", "signalValue", signalValue);
}

function preferenceSlider(preferenceId) {
  return byDataset("preference-slider", "preferenceId", preferenceId);
}

function routeCards() {
  return [...document.querySelectorAll('[data-testid="route-card"]')];
}

function subjectToggle(subject) {
  return byDataset("subject-toggle", "subject", subject);
}

function expectFirstRoute(expectedRoute) {
  expect(routeCards()[0]).toHaveTextContent(expectedRoute.title);
}

function selectOption(questionId, optionValue) {
  const button = discoveryOption(questionId, optionValue);
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "true");
}

describe("Careerize public launch selection system", () => {
  it("shows the two entry points clearly near the top of the experience", async () => {
    await renderApp();

    expect(screen.getByRole("heading", { level: 2, name: "Search a career" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /Career search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open first match/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Word graph" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Data: analysis/i })).toBeInTheDocument();
    expect(screen.getByText(/Real-world signal to confirm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open full profile/i })).toBeInTheDocument();
  });

  it("renders every question option, interest signal, lifestyle slider and subject-risk option", async () => {
    await renderApp();

    for (let index = 0; index < DISCOVERY_QUESTIONS.length; index += 1) {
      const question = DISCOVERY_QUESTIONS[index];
      for (const option of question.options) {
        expect(discoveryOption(question.id, option.value)).toHaveTextContent(option.label);
      }
      if (index < DISCOVERY_QUESTIONS.length - 1) {
        fireEvent.click(screen.getByRole("button", { name: /next question/i }));
      }
    }

    for (const signal of INTEREST_SIGNALS) {
      expect(interestSignal(signal.value)).toHaveTextContent(signal.label);
    }

    for (const preference of PREFERENCE_DEFINITIONS) {
      const slider = preferenceSlider(preference.id);
      expect(slider).toHaveAccessibleName(preference.label);
      expect(slider).toHaveValue(String(DEFAULT_LIFESTYLE_PREFERENCES[preference.id]));
    }

    for (const subject of SUBJECT_OPTIONS) {
      expect(subjectToggle(subject)).toHaveTextContent(subject);
    }
  });

  it("keeps rendered route ranking aligned with the scorer across all discovery steps and interest tags", async () => {
    await renderApp();

    const answers = {};
    const selectedSignals = [];

    for (let index = 0; index < DISCOVERY_QUESTIONS.length; index += 1) {
      const question = DISCOVERY_QUESTIONS[index];
      for (const option of question.options) {
        selectOption(question.id, option.value);
        answers[question.id] = option.value;
        expectFirstRoute(rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, DEFAULT_LIFESTYLE_PREFERENCES)[0]);
      }
      if (index < DISCOVERY_QUESTIONS.length - 1) {
        fireEvent.click(screen.getByRole("button", { name: /next question/i }));
      }
    }

    for (const signal of INTEREST_SIGNALS) {
      const button = interestSignal(signal.value);
      fireEvent.click(button);
      selectedSignals.push(signal.value);
      expect(button).toHaveAttribute("aria-pressed", "true");
      expectFirstRoute(rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, DEFAULT_LIFESTYLE_PREFERENCES)[0]);
    }
  });

  it("uses lifestyle sliders to refine visible results and clear discovery resets state", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(discoveryOption("interest", "people"));
    await user.click(interestSignal("care"));
    fireEvent.change(preferenceSlider("earnings"), { target: { value: "100" } });

    const expected = rankCareerRoutes(
      CAREER_ROUTES,
      { interest: "people" },
      ["care"],
      { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 }
    )[0];
    await waitFor(() => expectFirstRoute(expected));
    expect(preferenceSlider("earnings")).toHaveValue("100");

    await user.click(screen.getByRole("button", { name: /clear refinements/i }));

    expect(discoveryOption("interest", "people")).toHaveAttribute("aria-pressed", "false");
    expect(interestSignal("care")).toHaveAttribute("aria-pressed", "false");
    expect(preferenceSlider("earnings")).toHaveValue("50");
    expect(routeCards()).toHaveLength(3);
  });

  it("opens pathway details, updates the URL and exercises every subject-risk toggle", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(interestSignal("technology"));
    const firstCard = routeCards()[0];
    const routeId = firstCard.dataset.routeId;
    const route = CAREER_ROUTES.find((item) => item.id === routeId);
    expect(route).toBeTruthy();

    await user.click(byDataset("route-open", "routeId", routeId));
    await waitFor(() => expect(window.location.search).toContain(`pathway=${routeId}`));
    expect(screen.getAllByRole("heading", { name: route.title }).length).toBeGreaterThan(0);

    for (const subject of SUBJECT_OPTIONS) {
      const button = subjectToggle(subject);
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");
    }

    expect(screen.getByText(/subject-risk check/i)).toBeInTheDocument();
    expect(screen.getByText(/possible qualification routes/i)).toBeInTheDocument();
  });

  it("hydrates linkable exploration state from URL signals and pathway parameters", async () => {
    window.history.pushState({}, "", "/?signals=technology,care&pathway=data-analyst");
    await renderApp();

    expect(interestSignal("technology")).toHaveAttribute("aria-pressed", "true");
    expect(interestSignal("care")).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toContain("signals=technology%2Ccare");
    expect(window.location.search).toContain("pathway=data-analyst");
    expect(screen.getByRole("heading", { level: 2, name: "Data Analyst" })).toBeInTheDocument();
  });
});
