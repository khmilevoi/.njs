import { NjsToken } from "lexer/types";
import { ParserTarget, ParserVisitor } from "parser/parser.visitor";
import { NjsAstTree, NjsParser, NjsParserHandler } from "parser/types";

export class Parser implements NjsParser, ParserTarget {
  private readonly handlers: NjsParserHandler[] = [];
  private readonly visitor = new ParserVisitor(this);

  private savedIterator?: number;
  private iterator = 0;
  private tokens: NjsToken<any>[] = [];

  constructor(...handlers: NjsParserHandler[]) {
    this.handlers.push(...handlers);
  }

  parse(tokens: NjsToken<any>[]): NjsAstTree {
    this.tokens = tokens;

    return undefined as any;
  }

  getLine(): number {
    return 0;
  }

  save() {
    this.savedIterator = this.iterator;
  }

  revert(amount?: number): void {
    if (this.savedIterator != null) {
      this.iterator = this.savedIterator;
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
