import fs from "fs/promises";
import path from "path";
import { NjsLexer, NjsToken } from "../lexer/types";
import { NjsLogger } from "../logger/types";
import { NjsPreprocessor } from "../preprocessor/types";

export class Njs {
  constructor(
    private readonly logger: NjsLogger,
    private readonly preprocessor: NjsPreprocessor,
    private readonly lexer: NjsLexer
  ) {}

  static randomKey() {
    return Date.now();
  }

  static async loadFile(pathToFile: string) {
    const buffer = await fs.readFile(path.join(pathToFile));

    return buffer.toString();
  }

  private preprocessing(source: string, dir: string): Promise<string> {
    return this.preprocessor.run(source, dir);
  }

  private tokenize(source: string): NjsToken<any>[] {
    return this.lexer.run(source);
  }

  private parse(tokens: NjsToken<any>[]) {}

  private after(ast: any) {}

  async run(pathToFile: string) {
    try {
      this.logger.time("njs");

      const source = await Njs.loadFile(pathToFile);

      const parsedPath = path.parse(pathToFile);

      const transformed = await this.preprocessing(source, parsedPath.dir);
      const tokens = this.tokenize(transformed);
      const ast = this.parse(tokens);
      const result = this.after(ast);

      this.logger.time("njs");

      return result;
    } catch (error) {
      this.logger.handle(error);
    }
  }
}
