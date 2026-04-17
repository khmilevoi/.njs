import { NjsScopeModifier, NjsScopeVariable, NjsValue } from "./types";
import { Scope } from "./scope";
import { ExecutorError } from "../executor.error";

export abstract class NjsBaseScopeManager {
  protected scopes: Scope[] = [];
  protected modifiers: Map<string, NjsScopeModifier> = new Map();

  constructor(...modifiers: NjsScopeModifier[]) {
    for (const modifier of modifiers) {
      this.modifiers.set(modifier.type, modifier);
    }
    // Always create a global scope
    this.push();
  }

  push() {
    this.scopes.push(new Scope(this.modifiers));
  }

  pop() {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  get currentScope(): Scope {
    return this.scopes[this.scopes.length - 1];
  }

  get(name: string): NjsValue {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      const variable = scope.get(name);
      if (variable) {
        return variable.value;
      }
    }
    throw new ExecutorError(`Variable '${name}' is not defined`);
  }

  set(name: string, value: NjsValue): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      const variable = scope.get(name);
      if (variable) {
        scope.set(name, value);
        return;
      }
    }
    // If we reach here, it's not defined anywhere, so maybe set in current scope (or throw error in strict mode)
    // For now, let's set it in the current scope if not found.
    this.currentScope.set(name, value);
  }

  apply(variable: NjsScopeVariable): void {
    this.currentScope.apply(variable);
  }
}

export class ScopeManager extends NjsBaseScopeManager {}
