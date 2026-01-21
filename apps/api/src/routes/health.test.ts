import { APP_NAME, APP_VERSION } from "@repo/shared";
import { describe, expect, it } from "vitest";

describe("health route dependencies", () => {
  it("should have access to shared constants", () => {
    expect(APP_NAME).toBeDefined();
    expect(APP_VERSION).toBeDefined();
  });
});
