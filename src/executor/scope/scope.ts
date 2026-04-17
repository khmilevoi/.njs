import { NjsScope, NjsScopeVariable, NjsScopeModifier } from "./types";
import { ExecutorError } from "../executor.error";

export class Scope implements NjsScope {
  private readonly variables: Map<string, NjsScopeVariable> = new Map();

  constructor(private readonly modifiers: Map<string, NjsScopeModifier>) {}

  get(name: string): NjsScopeVariable | undefined {
    return this.variables.get(name);
  }

  set(name: string, value: any): void {
    const variable = this.variables.get(name);

    if (variable) {
      const modifier = this.modifiers.get(variable.type);
      if (modifier) {
        modifier.update(variable, value);
      }
      variable.value = value;
    } else {
      // Default to no modifier if not specified.
      this.variables.set(name, { type: "default", name, value });
    }
  }

  apply(variable: NjsScopeVariable): void {
    if (this.variables.has(variable.name)) {
      throw new ExecutorError(`Variable '${variable.name}' has already been declared`);
    }
    this.variables.set(variable.name, variable);
  }
}
