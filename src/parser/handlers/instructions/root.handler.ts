import { ParserVisitor } from "parser/parser.visitor";
import { InstructionHandler, NjsAstTree } from "parser/types";

export class RootHandler extends InstructionHandler {
  grammar = [];

  handle(visitor: ParserVisitor): NjsAstTree {
    return this.execute(visitor);
  }
}
