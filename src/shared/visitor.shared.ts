export type AcceptToken = string | RegExp;

export interface NjsTarget<Token = string> {
  peep(): Token;

  pop(): Token;

  revert(amount?: number): void;

  getLine(): number;
}

export abstract class NjsVisitor<Token = string> {
  constructor(protected readonly instance: NjsTarget<Token>) {}

  getLIne() {
    return this.instance.getLine();
  }

  peep(): Token {
    return this.instance.peep();
  }

  pop(): Token {
    return this.instance.pop();
  }
}
