import { ExecutorError } from "../executor.error";
import { NjsScopeModifier, NjsScopeVariable } from "./types";

export class ConstantScopeModifier implements NjsScopeModifier {
  readonly type = "constant";

  create(name: string, value: any): NjsScopeVariable {
    return {
      type: this.type,
      name,
      value,
    };
  }

  update(variable: NjsScopeVariable, newValue: any): void {
    throw new ExecutorError(`Assignment to constant variable: ${variable.name}`);
  }
}
