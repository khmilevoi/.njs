import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class NumberToken extends NjsBaseToken {
  readonly type: string = "number";
}

export class NumberHandler extends NjsBaseHandler {
  private readonly pattern = /^\d+(\.\d+)?$/;

  private readonly digit = /\d|\./;

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (this.processing) {
      if (this.digit.test(lexeme)) {
        descriptor.block = true;

        this.updateInner(lexeme);
      } else {
        if (this.pattern.test(this.inner)) {
          descriptor.token = new NumberToken(this.inner);

          this.stopProcessing();
          this.cleanInner();
        }
      }
    } else {
      if (this.digit.test(lexeme)) {
        this.startProcessing();
        this.updateInner(lexeme);
        descriptor.block = true;
      }
    }

    return descriptor;
  }
}
