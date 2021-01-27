import { StatementHandler } from "parser/handlers/statement.handler";
import { ParserVisitor } from "parser/parser.visitor";

export class StatementsHandler {
  private readonly grammar: any[] = [
    new StatementHandler(),
    new StatementsHandler(),
  ];

  execute(visitor: ParserVisitor) {
    const result = [];

    for (const handler of this.grammar) {
      const token = handler.handle(visitor);

      if (token) {
        result.push(token);
      }
    }

    return result;
  }

  handle(visitor: ParserVisitor) {
    const result = this.execute(visitor);

    return result;
  }
}
