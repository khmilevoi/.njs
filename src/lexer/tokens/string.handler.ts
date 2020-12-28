import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class StringToken extends NjsBaseToken {
  readonly type = "string";
}

export class StringHandler extends NjsBaseHandler {
  constructor(private readonly divider: string) {
    super();
  }

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (this.processing) {
      descriptor.block = true;

      if (lexeme !== this.divider) {
        this.updateInner(lexeme);
      }
    }

    if (lexeme === this.divider) {
      if (this.processing) {
        descriptor.block = true;
        descriptor.token = new StringToken(this.inner);
        this.stopProcessing();
        this.cleanInner();
      } else {
        descriptor.block = true;
        this.startProcessing();
      }
    }

    return descriptor;
  }
}
