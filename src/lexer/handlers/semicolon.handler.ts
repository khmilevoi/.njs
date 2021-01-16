import { LexerVisitor } from "lexer/lexer.visitor";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class SemicolonToken extends NjsBaseToken<never> {
  readonly type = "semicolon";
}

export class SemicolonHandler extends NjsBaseHandler<never> {
  public static readonly semicolon = ";";

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<never> {
    if (visitor.accept(SemicolonHandler.semicolon)) {
      visitor.pop();

      return {
        token: new SemicolonToken(),
      };
    }

    return {};
  }
}
