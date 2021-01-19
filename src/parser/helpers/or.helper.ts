import { ParserVisitor } from "parser/parser.visitor";
import { NjsAstTree, BaseTerminalHelper } from "parser/types";

export class Or extends BaseTerminalHelper {
  handle(visitor: ParserVisitor): NjsAstTree | null {
    for (const terminal of this.terminals) {
      const result = terminal.handle(visitor);

      if (result) {
        return result;
      }
    }

    return null;
  }
}
