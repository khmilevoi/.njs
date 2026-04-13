import { NjsToken } from "lexer/types";
import { OrHelper } from "parser/helpers/or.helper";
import { ParserTarget, ParserVisitor } from "parser/parser.visitor";
import { NjsAstNode, NjsAstTree, NjsParser, NjsTerminal } from "parser/types";

export class Parser implements NjsParser, ParserTarget {
  private readonly handler: NjsTerminal;
  private readonly visitor = new ParserVisitor(this);

  private iteratorStack: number[] = [];
  private iterator = 0;
  private tokens: NjsToken<any>[] = [];

  constructor(...handlers: NjsTerminal[]) {
    this.handler = new OrHelper(...handlers);
  }

  parse(tokens: NjsToken<any>[]): NjsAstTree {
    this.tokens = tokens;

    const root = this.handler.handle(this.visitor);

    return {
      root: root ?? new (class implements NjsAstNode {})(),
    };
  }

  getLine(): number {
    return 0;
  }

  save() {
    this.iteratorStack.push(this.iterator);
  }

  discard() {
    if (this.iteratorStack.length > 0) {
      this.iteratorStack.pop();
    }
  }

  revert(amount?: number): void {
    if (amount != null) {
      this.iterator -= amount;
      if (this.iterator < 0) this.iterator = 0;
    } else if (this.iteratorStack.length > 0) {
      this.iterator = this.iteratorStack.pop() as number;
    }
  }

  peep(): NjsToken<any> {
    return this.tokens[this.iterator];
  }

  pop(): NjsToken<any> {
    const prev = this.tokens[this.iterator];

    if (this.iterator < this.tokens.length) {
      this.iterator += 1;
    }

    return prev;
  }
}
