import { NjsHandler, NjsLexer, NjsToken } from "./types";

export class Lexer implements NjsLexer {
  private readonly handlers: NjsHandler[];

  private readonly tokens: NjsToken[] = [];
  private lexemes: string = "";
  private currentHandler: NjsHandler | null = null;

  constructor(...handlers: NjsHandler[]) {
    this.handlers = handlers;
  }

  run(source: string): NjsToken[] {
    for (const lexeme of source) {
      this.readLexeme(lexeme, this.currentHandler);

      if (this.currentHandler == null) {
        for (const handler of this.handlers) {
          const descriptor = this.readLexeme(lexeme, handler);

          if (descriptor?.block === true) {
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

    if (descriptor?.token != null) {
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
