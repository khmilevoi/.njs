import { describe, it, expect, vi } from "vitest";
import { njs } from "../index";

describe("Njs", () => {
  it("should run a valid script successfully", async () => {
    // The concept.njs is a complex script, but currently execute evaluates to null
    // Let's just ensure that running it doesn't crash
    const result = await njs.run("src/__tests__/resources/concept.njs");
    expect(result).toBeNull();
  });

  it("should handle error during run gracefully", async () => {
    // njs catches errors and sends them to the logger, which calls console.log
    const consoleSpy = vi.spyOn(console, "log");

    // This file has syntax error in lexer and will crash
    const result = await njs.run("src/__tests__/resources/lexer/crash.njs");

    expect(result).toBeUndefined(); // Returns undefined because of catch block without return
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
