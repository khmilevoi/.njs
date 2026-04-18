export type NjsValue = unknown;
export interface NjsScopeVariable {
  type: string;
  name: string;
  value: NjsValue;
}

export interface NjsScopeModifier {
  readonly type: string;
  create(name: string, value: NjsValue): NjsScopeVariable;
  update(variable: NjsScopeVariable, newValue: NjsValue): void;
}

export interface NjsScope {
  get(name: string): NjsScopeVariable | undefined;
  set(name: string, value: NjsValue, modifiers?: NjsScopeModifier[]): void;
  apply(variable: NjsScopeVariable): void;
}
