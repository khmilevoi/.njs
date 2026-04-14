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
  get grammar(): NjsGrammarItem[] {
    return [];
  }

  private visitor!: ParserVisitor;

  handle(visitor: ParserVisitor): NjsAstNode | null {
    const result: NjsParserHandledItem[] = [];

    visitor.save(); // Save iterator position before applying grammar items

    for (const item of this.grammar) {
      const handled = this.evaluateHandler(item, visitor);

      if (handled) {
        result.push(handled);
      } else {
        visitor.revert(); // Revert to the saved state and pop the stack
        return null;
      }
    }

    visitor.discard(); // Pop the saved state because we succeeded
    return this.parse(result);
  }

  protected abstract parse(items: NjsParserHandledItem[]): NjsAstNode;

  private handleRegExp(handler: RegExp) {
    const token = this.visitor.peep();
    if (token && token.inner != null && handler.test(token.inner.toString())) {
      return this.visitor.pop();
    }

    return null;
  }

  private handleString(handler: string) {
    const token = this.visitor.peep();
    if (token && token.inner != null && handler === token.inner.toString()) {
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
