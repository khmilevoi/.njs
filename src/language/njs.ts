import { NjsLexer } from "../lexer/types";
import { NjsLogger } from "../logger/types";

export class Njs {
  constructor(
    private readonly logger: NjsLogger,
    private readonly lexer: NjsLexer
  ) {}

  tokenize(source: string) {
    return this.lexer.run(source);
  }

  run(source: string) {
    try {
      this.logger.log("start");

      const tokens = this.tokenize(source);
      // const ast = this.parser.run(tokens);
      // const result = this.interpreter.run(ast);

      //  return result;
    } catch (error) {
      this.logger.handle(error);
    }
  }
}
