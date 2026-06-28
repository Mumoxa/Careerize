import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog";
import { SCHOOL_SUBJECTS } from "./data/subjectRules";
import { DEFAULT_REALITY_PREFERENCES, rankCareerRoutes } from "./lib/scoring";

const LOCAL_RECORD_PREFIX = "careerize.discovery.";

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function renderApp() {
  const view = render(<App />);
  await screen.findByRole("button", { name: /log in or create saved profile/i });
  return view;
}

function routeButtons() {
  return [...document.querySelectorAll('[data-testid="route-result"]')];
}

function controlByDataset(testId, field, value) {
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
  return controlByDataset("interest-signal", "signalValue", signalValue);
}

function subjectToggle(subject) {
  return controlByDataset("subject-toggle", "subject", subject);
}

function subjectMark(subject) {
  return controlByDataset("subject-mark", "subject", subject);
}

function expectFirstRouteToMatch(expectedRoute) {
  expect(routeButtons()[0]).toHaveTextContent(`1. ${expectedRoute.title}`);
}

function expectSliderValue(label, value) {
  expect(screen.getByRole("slider", { name: label })).toHaveValue(String(value));
}

function changeSlider(label, value) {
  fireEvent.change(screen.getByRole("slider", { name: label }), { target: { value: String(value) } });
}

describe("Careerize learner selection system", () => {
  it("renders every learner-facing selection option and the default route list", async () => {
    await renderApp();

    for (const question of DISCOVERY_QUESTIONS) {
      for (const option of question.options) {
        expect(discoveryOption(question.id, option.value)).toHaveTextContent(option.label);
      }
    }

    for (const signal of INTEREST_SIGNALS) {
      expect(interestSignal(signal.value)).toHaveTextContent(signal.label);
    }

    for (const subject of SCHOOL_SUBJECTS) {
      expect(subjectToggle(subject)).toHaveTextContent(subject);
    }

    for (const [dimension, value] of Object.entries(DEFAULT_REALITY_PREFERENCES)) {
      const labels = {
        earning: "Earning ambition",
        travel: "Travel and movement",
        stress: "Stress tolerance",
        danger: "Safety and danger tolerance",
      };
      expectSliderValue(labels[dimension], value);
    }

    const expectedDefault = rankCareerRoutes(CAREER_ROUTES, {}, [], DEFAULT_REALITY_PREFERENCES)[0];
    expectFirstRouteToMatch(expectedDefault);
    expect(screen.getAllByRole("heading", { name: expectedDefault.title }).length).toBeGreaterThan(0);
  });

  it("clicks every quick-question option and interest tag and keeps rendered rankings aligned with the scorer", async () => {
    await renderApp();

    const answers = {};
    const selectedSignals = [];

    for (const question of DISCOVERY_QUESTIONS) {
      for (const option of question.options) {
        const button = discoveryOption(question.id, option.value);
        fireEvent.click(button);
        answers[question.id] = option.value;
        expect(button).toHaveAttribute("aria-pressed", "true");

        const expected = rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, DEFAULT_REALITY_PREFERENCES)[0];
        expectFirstRouteToMatch(expected);
      }
    }

    for (const signal of INTEREST_SIGNALS) {
      const button = interestSignal(signal.value);
      fireEvent.click(button);
      selectedSignals.push(signal.value);
      expect(button).toHaveAttribute("aria-pressed", "true");

      const expected = rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, DEFAULT_REALITY_PREFERENCES)[0];
      expectFirstRouteToMatch(expected);
    }
  });

  it("changes reality sliders in the rendered UI and reset clears answers, tags, manual career and sliders", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Working with people" }));
    await user.click(screen.getByRole("button", { name: "Caring for people" }));
    changeSlider("Earning ambition", 100);

    const highEarningExpected = rankCareerRoutes(
      CAREER_ROUTES,
      { interest: "people" },
      ["care"],
      { ...DEFAULT_REALITY_PREFERENCES, earning: 100 }
    )[0];
    await waitFor(() => expectFirstRouteToMatch(highEarningExpected));
    expect(routeButtons()[0]).toHaveTextContent(`${highEarningExpected.realityFit.matchPercent}% reality`);

    await user.click(routeButtons()[1]);
    expect(routeButtons()[1]).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByRole("button", { name: "Working with people" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Caring for people" })).toHaveAttribute("aria-pressed", "false");
    expectSliderValue("Earning ambition", 50);

    const defaultExpected = rankCareerRoutes(CAREER_ROUTES, {}, [], DEFAULT_REALITY_PREFERENCES)[0];
    await waitFor(() => expectFirstRouteToMatch(defaultExpected));
    expect(routeButtons()[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("supports subject and mark selection controls without breaking the active pathway view", async () => {
    await renderApp();

    const stageSelect = screen.getByTestId("school-stage-select");
    fireEvent.change(stageSelect, { target: { value: "Grade 11" } });
    expect(stageSelect).toHaveValue("Grade 11");

    for (const subject of SCHOOL_SUBJECTS) {
      fireEvent.click(subjectToggle(subject));
      const input = subjectMark(subject);
      fireEvent.change(input, { target: { value: "65" } });
      expect(input).toHaveValue(65);
    }

    expect(screen.getByText(/pathway signal/i)).toBeInTheDocument();
    expect(screen.getAllByText(/qualification routes/i).length).toBeGreaterThan(0);
  });

  it("saves and restores answers, interest tags, active route and reality sliders", async () => {
    const user = userEvent.setup();
    const view = await renderApp();

    await user.type(screen.getByLabelText(/learner name/i), "Lerato");
    await user.type(screen.getByLabelText(/email/i), "learner@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /log in or create saved profile/i }));
    await screen.findByRole("button", { name: /save learner profile/i });

    await user.click(screen.getByRole("button", { name: "Working with people" }));
    await user.click(screen.getByRole("button", { name: "Caring for people" }));
    changeSlider("Earning ambition", 85);
    changeSlider("Safety and danger tolerance", 10);

    const expectedRanking = rankCareerRoutes(
      CAREER_ROUTES,
      { interest: "people" },
      ["care"],
      { ...DEFAULT_REALITY_PREFERENCES, earning: 85, danger: 10 }
    );
    await waitFor(() => expectFirstRouteToMatch(expectedRanking[0]));

    await user.click(routeButtons()[1]);
    expect(routeButtons()[1]).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /save learner profile/i }));
    await screen.findByText(/saved\. you can return later/i);

    const stored = JSON.parse(window.localStorage.getItem(`${LOCAL_RECORD_PREFIX}learner@example.com`));
    expect(stored.discovery.answers).toEqual({ interest: "people" });
    expect(stored.discovery.selected_signals).toEqual(["care"]);
    expect(stored.discovery.reality_preferences).toMatchObject({ earning: 85, travel: 50, stress: 50, danger: 10 });
    expect(stored.discovery.best_match).toBe(expectedRanking[1].id);

    view.unmount();
    render(<App />);
    await screen.findByText(/saved learner profile and discovery view have been restored/i);

    expect(screen.getByRole("button", { name: "Working with people" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Caring for people" })).toHaveAttribute("aria-pressed", "true");
    expectSliderValue("Earning ambition", 85);
    expectSliderValue("Safety and danger tolerance", 10);
    expect(
      screen.getByRole("button", { name: new RegExp(`\\d+\\. ${escapeRegExp(expectedRanking[1].title)}`) })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
