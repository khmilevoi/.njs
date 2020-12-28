import {
  NjsBaseToken,
  NjsBaseHandler,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class ServiceSymbolsToken extends NjsBaseToken {
  readonly type = "service-symbol";
}

export class ServiceSymbolsHandler extends NjsBaseHandler {
  private readonly pattern = /(?=\W)(?=\S)./;

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (this.pattern.test(lexeme)) {
      descriptor.block = true;
      descriptor.token = new ServiceSymbolsToken(lexeme);
    }

    return descriptor;
  }
}
