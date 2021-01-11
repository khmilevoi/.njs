export type AcceptToken = string | RegExp;

export interface NjsTarget {
  peep(): string;

  pop(): string;

  revert(amount?: number): void;
}

export class NjsVisitor {
  constructor(private readonly instance: NjsTarget) {}

  peep(): string {
    return this.instance.peep();
  }

  pop(): string {
    return this.instance.pop();
  }

  revert(amount?: number) {
    return this.instance.revert(amount);
  }

  accept(...tokens: AcceptToken[]): boolean {
    const lexeme = this.peep();

    return tokens.some((item) => {
      if (item instanceof RegExp && lexeme) {
        return item.test(lexeme);
      }

      return item === lexeme;
    });
  }

  notAccept(...tokens: AcceptToken[]): boolean {
    return !this.accept(...tokens);
  }

  popWhileAccept(...tokens: AcceptToken[]): void {
    while (this.accept(...tokens)) {
      this.pop();
    }
  }

  popWhileNotAccept(...tokens: AcceptToken[]): void {
    while (this.notAccept(...tokens)) {
      this.pop();
    }
  }
}
