import { describe, expect, it } from "vitest";
import { APP_NAME, APP_VERSION, API_PORT, WEB_PORT } from "./constants";

describe("constants", () => {
  it("should have correct app name", () => {
    expect(APP_NAME).toBe("Turbo Electron App");
  });

  it("should have app version", () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe("string");
  });

  it("should have correct port numbers", () => {
    expect(API_PORT).toBe(3001);
    expect(WEB_PORT).toBe(3000);
  });
});
