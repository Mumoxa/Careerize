import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

const motionProps = new Set([
  "animate",
  "exit",
  "initial",
  "layout",
  "transition",
  "variants",
  "whileHover",
  "whileInView",
  "whileTap",
]);

function stripMotionProps(props) {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !motionProps.has(key)));
}

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: new Proxy({}, {
    get: (_target, tag) =>
      React.forwardRef(({ children, ...props }, ref) =>
        React.createElement(tag, { ...stripMotionProps(props), ref }, children)
      ),
  }),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
