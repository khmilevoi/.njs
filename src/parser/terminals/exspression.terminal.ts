import { ParserError } from "parser/parser.error";
import { ParserVisitor } from "parser/parser.visitor";
import { ExpressionHandler, NjsAstTree, NjsTerminal } from "parser/types";
import { Singleton } from "shared/singleton.shared";

export class Expression extends Singleton implements NjsTerminal {
  private readonly expressions: ExpressionHandler[] = [];

  constructor(...expressions: ExpressionHandler[]) {
    super();

    this.expressions.push(...expressions);
  }

  handle(visitor: ParserVisitor): NjsAstTree {
    for (const expression of this.expressions) {
      const result = expression.handle(visitor);

      if (result) {
        return result;
      }
    }

    throw new ParserError("unknown expression", visitor.getLIne());
  }
}
