import { AcceptToken, NjsVisitor } from "shared/visitor.shared";

export class LexerVisitor extends NjsVisitor {
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
