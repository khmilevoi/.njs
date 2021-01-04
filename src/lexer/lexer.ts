import { OneLineCommentToken } from "./tokens/one-line-comment.handler";
import { NjsHandler, NjsLexer, NjsToken } from "./types";

export class Lexer implements NjsLexer {
  private readonly handlers: NjsHandler[];

  private readonly tokens: NjsToken[] = [];
  private lexemes: string = "";
  private currentHandler: NjsHandler | null = null;
  private blockIndex = 0;

  constructor(...handlers: NjsHandler[]) {
    this.handlers = handlers;
  }

  run(source: string): NjsToken[] {
    for (let index = 0; index < source.length; ++index) {
      let lexeme = source[index];

      if (lexeme === "\r") {
        continue;
      }

      let currentHandlers = this.handlers;
      let prevHandler = this.currentHandler;

      const descriptor = this.readLexeme(lexeme, this.currentHandler);

      if (descriptor?.reset) {
        this.currentHandler = null;

        if (prevHandler) {
          currentHandlers = currentHandlers.filter(
            (handler) => handler !== prevHandler
          );
        }

        index = this.blockIndex;
        lexeme = source[index];
        this.lexemes = this.lexemes.substring(0, index);
      }

      if (this.currentHandler == null) {
        for (const handler of currentHandlers) {
          const descriptor = this.readLexeme(lexeme, handler);

          if (descriptor?.block === true || descriptor?.token) {
            this.blockIndex = index;
            break;
          }
        }
      }

      this.lexemes += lexeme;
    }

    return this.tokens;
  }

  private readLexeme(lexeme: string, handler: NjsHandler | null) {
    const descriptor = handler?.read(
      lexeme,
      this.tokens.slice(-(handler.descriptor.previous || this.tokens.length)),
      this.lexemes.substr(-(handler.descriptor.previous || this.lexemes.length))
    );

    if (descriptor?.token != null && !handler?.descriptor.exclude) {
      this.tokens.push(descriptor.token);
    }

    if (descriptor?.block === true) {
      this.currentHandler = handler;
    } else {
      this.currentHandler = null;
    }

    return descriptor;
  }
}
