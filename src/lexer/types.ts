export interface NjsLexerHandlerLexemeDescriptor {
  block: boolean;
  reset: boolean;
  token?: NjsToken;
}

export interface NjsLexerHandlerDescriptor {
  previous?: number;
  exclude?: boolean;
}

export interface NjsHandler {
  readonly descriptor: NjsLexerHandlerDescriptor;

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor;
}

export abstract class NjsBaseHandler implements NjsHandler {
  readonly descriptor: NjsLexerHandlerDescriptor = {
    previous: 0,
    exclude: false,
  };
  protected processing = false;
  protected inner = "";

  abstract read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor;

  protected updateInner(lexeme: string) {
    this.inner += lexeme;
  }

  protected cleanInner() {
    this.inner = "";
  }

  protected setInner(inner: string) {
    this.inner = inner;
  }

  protected startProcessing() {
    this.processing = true;
  }

  protected stopProcessing() {
    this.processing = false;
  }

  protected createDescriptor(): NjsLexerHandlerLexemeDescriptor {
    return {
      block: false,
      reset: false,
    };
  }
}

export interface NjsToken {
  readonly type: string;
  readonly inner?: string;

  toString(): string;
}

export abstract class NjsBaseToken implements NjsToken {
  abstract readonly type: string = "base";

  constructor(public readonly inner: string = "") {}

  toString(): string {
    return this.inner;
  }
}

export interface NjsLexer {
  run(source: string): NjsToken[];
}
