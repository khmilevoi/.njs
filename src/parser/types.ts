import { NjsToken } from "lexer/types";
import { ParserVisitor } from "parser/parser.visitor";

export interface NjsAstTree {
  root: NjsAstNode;
}

export interface NjsAstNode {}

export interface NjsParser {
  parse(tokens: NjsToken<any>[]): NjsAstTree;
}

export type NjsGrammarItem = string | RegExp | NjsTerminal;

export interface NjsTerminal {
  readonly grammar: NjsGrammarItem[];

  handle(visitor: ParserVisitor): NjsAstNode | null;
}

export type NjsParserHandledItem = NjsToken<any> | NjsAstNode;

export abstract class NjsBaseTerminal implements NjsTerminal {
  readonly grammar: NjsGrammarItem[] = [];

  private visitor!: ParserVisitor;

  handle(visitor: ParserVisitor): NjsAstNode | null {
    const result: NjsParserHandledItem[] = [];

    for (const item of this.grammar) {
      const handled = this.evaluateHandler(item, visitor);

      if (handled) {
        result.push(handled);
      } else {
        visitor.revert();

        return null;
      }
    }

    return this.parse(result);
  }

  protected abstract parse(items: NjsParserHandledItem[]): NjsAstNode;

  private handleRegExp(handler: RegExp) {
    if (handler.test(this.visitor.peep().inner.toString())) {
      return this.visitor.pop();
    }

    return null;
  }

  private handleString(handler: string) {
    if (handler === this.visitor.peep().inner.toString()) {
      return this.visitor.pop();
    }

    return null;
  }

  protected evaluateHandler(handler: NjsGrammarItem, visitor: ParserVisitor) {
    this.visitor = visitor;

    if (handler instanceof RegExp) {
      return this.handleRegExp(handler);
    }

    if (typeof handler === "string") {
      return this.handleString(handler);
    }

    if (handler instanceof NjsBaseTerminal) {
      return handler.handle(this.visitor);
    }

    return null;
  }
}
