import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class SemicolonToken extends NjsBaseToken {
  readonly type = "semicolon";
}

export class SemicolonHandler extends NjsBaseHandler {
  private readonly semicolon = ";";

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (lexeme === this.semicolon) {
      descriptor.block = true;
      descriptor.token = new SemicolonToken(this.semicolon);
    }

    return descriptor;
  }
}
