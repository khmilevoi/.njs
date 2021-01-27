import { NjsToken } from "lexer/types";
import { ParserTarget, ParserVisitor } from "parser/parser.visitor";
import { NjsAstTree, NjsParser } from "parser/types";

export class Parser implements NjsParser, ParserTarget {
  private readonly handlers: any[] = [];
  private readonly visitor = new ParserVisitor(this);

  private savedIterator?: Generator<NjsToken<any>>;
  private iterator?: Generator<NjsToken<any>>;
  private currentToken?: IteratorResult<NjsToken<any>>;

  constructor(...handlers: any[]) {
    this.handlers.push(...handlers);
  }

  parse(tokens: Generator<NjsToken<any>>): NjsAstTree {
    this.iterator = tokens;
    this.currentToken = tokens.next();

    return undefined as any;
  }

  getLine(): number {
    return 0;
  }

  save() {
    this.savedIterator = this.iterator;
  }

  revert(amount?: number): void {
    this.iterator = this.savedIterator;
  }

  peep(): NjsToken<any> {
    return this.currentToken?.value;
  }

  pop(): NjsToken<any> {
    const prev = this.currentToken?.value;

    if (!this.currentToken?.done) {
      this.iterator?.next();
    }

    return prev;
  }
}
