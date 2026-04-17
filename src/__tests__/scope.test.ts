import { describe, expect, it, beforeEach } from "vitest";
import { ScopeManager, ConstantScopeModifier, Scope } from "executor";

describe("Scope System", () => {
  let scopeManager: ScopeManager;
  let constantModifier: ConstantScopeModifier;

  beforeEach(() => {
    constantModifier = new ConstantScopeModifier();
    scopeManager = new ScopeManager(constantModifier);
  });

  it("should set and get a variable", () => {
    scopeManager.set("x", 10);
    expect(scopeManager.get("x")).toBe(10);
  });

  it("should handle nested scopes via push/pop", () => {
    scopeManager.set("global", "yes");
    scopeManager.set("x", 1);

    scopeManager.push();
    scopeManager.set("x", 2); // Creates 'x' in the inner scope implicitly if we want, or updates.
    // Let's test apply instead to declare in current scope
    scopeManager.apply({ type: "default", name: "y", value: "inner" });

    expect(scopeManager.get("global")).toBe("yes");
    expect(scopeManager.get("y")).toBe("inner");

    scopeManager.pop();

    expect(() => scopeManager.get("y")).toThrow("Variable 'y' is not defined");
  });

  it("should prevent updating a constant variable", () => {
    scopeManager.apply(constantModifier.create("PI", 3.14));
    expect(scopeManager.get("PI")).toBe(3.14);

    expect(() => {
      scopeManager.set("PI", 3.14159);
    }).toThrow("Assignment to constant variable: PI");
  });

  it("should prevent re-declaring a variable in the same scope", () => {
    scopeManager.apply({ type: "default", name: "x", value: 1 });
    expect(() => {
      scopeManager.apply({ type: "default", name: "x", value: 2 });
    }).toThrow("Variable 'x' has already been declared");
  });
});
