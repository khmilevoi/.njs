import { NjsPreprocessor, NjsPreprocessorHandler } from "./types";

export class Preprocessor implements NjsPreprocessor {
  private readonly handlers: NjsPreprocessorHandler[] = [];

  constructor(...handlers: NjsPreprocessorHandler[]) {
    this.handlers.push(...handlers);
  }

  async run(source: string, dir: string): Promise<string> {
    const handler = this.handlers.reduce(
      (func, current) => async (origin: string) =>
        current.transform(await func(origin), dir),
      async (s: string): Promise<string> => s
    );

    return await handler(source);
  }
}
