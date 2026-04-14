import fs from "fs/promises";
import { NjsLexer, NjsToken } from "lexer/types";
import { NjsLogger } from "logger/types";
import { NjsAstTree, NjsParser } from "parser/types";
import path from "path";
import { NjsExecutor } from "executor/types";

export class Njs {
  constructor(
    private readonly logger: NjsLogger,
    private readonly lexer: NjsLexer,
    private readonly parser: NjsParser,
    private readonly executor: NjsExecutor,
  ) {}

  static randomKey() {
    return Date.now();
  }

  static async loadFile(pathToFile: string) {
    const buffer = await fs.readFile(path.join(pathToFile));

    return buffer.toString();
  }

  tokenize(source: string): NjsToken<any>[] {
    return this.lexer.run(source);
  }

  parse(tokens: NjsToken<any>[]) {
    return this.parser.parse(tokens);
  }

  execute(ast: NjsAstTree) {
    return this.executor.execute(ast.root);
  }

  async run(pathToFile: string) {
    try {
      this.logger.time("njs");

      const source = await Njs.loadFile(pathToFile);

      const parsedPath = path.parse(pathToFile);

      const tokens = this.tokenize(source);
      const ast = this.parse(tokens);
      const result = this.execute(ast);

      this.logger.time("njs");

      return result;
    } catch (error) {
      this.logger.handle(error);
    }
  }
}
