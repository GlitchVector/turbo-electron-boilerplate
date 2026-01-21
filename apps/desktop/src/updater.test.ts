import { IPC_CHANNELS } from "@repo/shared";
import { describe, expect, it } from "vitest";

describe("updater dependencies", () => {
  it("should have access to IPC channels from shared", () => {
    expect(IPC_CHANNELS).toBeDefined();
    expect(IPC_CHANNELS.UPDATE_CHECK).toBe("update:check");
    expect(IPC_CHANNELS.UPDATE_DOWNLOAD).toBe("update:download");
    expect(IPC_CHANNELS.UPDATE_INSTALL).toBe("update:install");
  });
});
