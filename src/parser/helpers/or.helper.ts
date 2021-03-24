import { ParserVisitor } from "parser/parser.visitor";
import {
  NjsAstNode,
  NjsBaseTerminal,
  NjsGrammarItem,
  NjsParserHandledItem,
} from "parser/types";

export class OrHelper extends NjsBaseTerminal {
  private readonly handlers: NjsGrammarItem[];

  constructor(...handlers: NjsGrammarItem[]) {
    super();

    this.handlers = handlers;
  }

  handle(visitor: ParserVisitor): NjsAstNode | null {
    for (let handler of this.handlers) {
      const result = this.evaluateHandler(handler, visitor);

      if (result) {
        return result;
      }
    }

    return null;
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return {} as any;
  }
}
