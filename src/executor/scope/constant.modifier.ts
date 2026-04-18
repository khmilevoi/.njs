import { ExecutorError } from "../executor.error";
import { NjsScopeModifier, NjsScopeVariable, NjsValue } from "./types";

export class ConstantScopeModifier implements NjsScopeModifier {
  readonly type = "constant";

  create(name: string, value: NjsValue): NjsScopeVariable {
    return {
      type: this.type,
      name,
      value,
    };
  }

  update(variable: NjsScopeVariable, newValue: NjsValue): void {
    throw new ExecutorError(`Assignment to constant variable: ${variable.name}`);
  }
}
