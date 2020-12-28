import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class NewLineToken extends NjsBaseToken {
  readonly type = "new-line";
}

export class NewLineHandler extends NjsBaseHandler {
  private readonly newLine = "\n";

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (lexeme === this.newLine) {
      descriptor.block = true;
      descriptor.token = new NewLineToken(this.newLine);
    }

    return descriptor;
  }
}
