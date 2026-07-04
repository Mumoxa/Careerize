import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { CAREER_ROUTES, INTEREST_SELECTION_LIMIT, INTEREST_SIGNALS } from "./data/careerCatalog";
import {
  DEFAULT_LIFESTYLE_PREFERENCES,
  PREFERENCE_DEFINITIONS,
  rankCareerRoutes,
  validateInterestSignalTaxonomy,
} from "./lib/scoring";

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
  await screen.findByRole("heading", { name: /turn interests into career paths/i });
}

function byDataset(testId, field, value) {
  const match = [...document.querySelectorAll(`[data-testid="${testId}"]`)].find((element) => element.dataset[field] === value);
  expect(match, `${testId} ${field}=${value} should be rendered`).toBeTruthy();
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

describe("Careerize focused homepage and wordmap", () => {
  it("shows two clear homepage entry paths and removes repeated refinement sections", async () => {
    await renderApp();

    expect(screen.getByText(/Careerize helps young people connect raw interests/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /start with what you like/i }).some((link) => link.getAttribute("href") === "#word-graph")).toBe(true);
    expect(screen.getAllByRole("link", { name: /explore career paths/i }).some((link) => link.getAttribute("href") === "#matches")).toBe(true);
    expect(screen.getByRole("heading", { level: 2, name: /interest word map/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /explore career paths/i })).toBeInTheDocument();

    expect(screen.queryByText("Refine matches")).not.toBeInTheDocument();
    expect(screen.queryByText("Signals to refine")).not.toBeInTheDocument();
    expect(screen.queryByText("Career reality sliders")).not.toBeInTheDocument();
  });

  it("renders only mapped interest words, categories, sliders and subject-risk options", async () => {
    await renderApp();

    const taxonomy = validateInterestSignalTaxonomy(INTEREST_SIGNALS, CAREER_ROUTES, PREFERENCE_DEFINITIONS);
    expect(taxonomy.valid, taxonomy.errors.join("\n")).toBe(true);

    const labels = INTEREST_SIGNALS.map((signal) => signal.label.toLowerCase());
    expect(new Set(labels).size).toBe(labels.length);

    for (const signal of INTEREST_SIGNALS) {
      const button = interestSignal(signal.value);
      expect(button).toHaveTextContent(signal.label);
      expect(signal.skills.length).toBeGreaterThan(0);
      expect(signal.sliderDimensions.length).toBeGreaterThan(0);
    }

    const wordMap = screen.getByRole("list", { name: /mapped interest keywords/i });
    for (const preference of PREFERENCE_DEFINITIONS) {
      const slider = preferenceSlider(preference.id);
      expect(slider).toHaveAccessibleName(preference.label);
      expect(slider).toHaveValue(String(DEFAULT_LIFESTYLE_PREFERENCES[preference.id]));
      expect(slider.compareDocumentPosition(wordMap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }

    for (const subject of SUBJECT_OPTIONS) {
      expect(subjectToggle(subject)).toHaveTextContent(subject);
    }
  });

  it("selects and deselects wordmap interests and explains path suggestions", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(interestSignal("technology"));

    const expected = rankCareerRoutes(CAREER_ROUTES, {}, ["technology"], DEFAULT_LIFESTYLE_PREFERENCES)[0];
    await waitFor(() => expectFirstRoute(expected));
    expect(interestSignal("technology")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("selected-interest-count")).toHaveTextContent("1 / 20 selected");
    expect(screen.getAllByText(/Why this path may fit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Related skills/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Possible learning route/i).length).toBeGreaterThan(0);

    await user.click(interestSignal("technology"));
    expect(interestSignal("technology")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/No path is suggested yet/i)).toBeInTheDocument();
  });

  it("enforces the maximum of 20 selected interest keywords", async () => {
    const user = userEvent.setup();
    await renderApp();

    for (const signal of INTEREST_SIGNALS.slice(0, INTEREST_SELECTION_LIMIT)) {
      await user.click(interestSignal(signal.value));
    }

    expect(screen.getByTestId("selected-interest-count")).toHaveTextContent("20 / 20 selected");
    expect(screen.getByText(/Limit reached/i)).toBeInTheDocument();
    expect(interestSignal(INTEREST_SIGNALS[INTEREST_SELECTION_LIMIT].value)).toBeDisabled();

    await user.click(interestSignal(INTEREST_SIGNALS[0].value));
    expect(screen.getByTestId("selected-interest-count")).toHaveTextContent("19 / 20 selected");
    expect(interestSignal(INTEREST_SIGNALS[INTEREST_SELECTION_LIMIT].value)).not.toBeDisabled();
  });

  it("uses slider values to influence visible path ordering and reset clears state", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(interestSignal("handsOn"));
    await user.click(interestSignal("tools"));
    fireEvent.change(preferenceSlider("danger"), { target: { value: "100" } });

    const expected = rankCareerRoutes(
      CAREER_ROUTES,
      {},
      ["handsOn", "tools"],
      { ...DEFAULT_LIFESTYLE_PREFERENCES, danger: 100 }
    )[0];
    await waitFor(() => expectFirstRoute(expected));
    expect(preferenceSlider("danger")).toHaveValue("100");
    expect(screen.getAllByText(/Slider influence/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /reset word map/i }));

    expect(interestSignal("handsOn")).toHaveAttribute("aria-pressed", "false");
    expect(interestSignal("tools")).toHaveAttribute("aria-pressed", "false");
    expect(preferenceSlider("danger")).toHaveValue("50");
    expect(screen.getByTestId("selected-interest-count")).toHaveTextContent("0 / 20 selected");
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

  it("hydrates linkable wordmap state from URL signals and pathway parameters", async () => {
    window.history.pushState({}, "", "/?signals=technology,care&pathway=data-analyst");
    await renderApp();

    expect(interestSignal("technology")).toHaveAttribute("aria-pressed", "true");
    expect(interestSignal("care")).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toContain("signals=technology%2Ccare");
    expect(window.location.search).toContain("pathway=data-analyst");
    expect(screen.getByRole("heading", { level: 2, name: "Data Analyst" })).toBeInTheDocument();
  });
});
