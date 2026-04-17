export interface NjsScopeVariable {
  type: string;
  name: string;
  value: any;
}

export interface NjsScopeModifier {
  readonly type: string;
  create(name: string, value: any): NjsScopeVariable;
  update(variable: NjsScopeVariable, newValue: any): void;
}

export interface NjsScope {
  get(name: string): NjsScopeVariable | undefined;
  set(name: string, value: any, modifiers?: NjsScopeModifier[]): void;
  apply(variable: NjsScopeVariable): void;
}
