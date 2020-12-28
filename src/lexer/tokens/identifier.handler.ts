import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class IdentifierToken extends NjsBaseToken {
  readonly type = "identifier";
}

export class IdentifierHandler extends NjsBaseHandler {
  private readonly pattern = /^[a-zA-Z]\w*$/;

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (/\w/.test(lexeme)) {
      this.startProcessing();
    }

    if (/\W/.test(lexeme)) {
      this.stopProcessing();
      descriptor.block = false;

      if (this.pattern.test(this.inner)) {
        descriptor.token = new IdentifierToken(this.inner);
      } else {
        descriptor.reset = true;
      }

      this.cleanInner();
    }

    if (this.processing) {
      descriptor.block = true;
      this.updateInner(lexeme);
    }

    return descriptor;
  }
}
