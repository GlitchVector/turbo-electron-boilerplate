import { describe, expect, it } from "vitest";
import { getEnvironment, isBrowser, isElectron } from "./environment";

describe("environment detection", () => {
  it("should detect browser environment in jsdom", () => {
    // In jsdom, window exists but electronAPI doesn't
    expect(isBrowser()).toBe(true);
  });

  it("should not detect electron in jsdom", () => {
    expect(isElectron()).toBe(false);
  });

  it("should return browser as environment in jsdom", () => {
    expect(getEnvironment()).toBe("browser");
  });
});
