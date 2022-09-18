import { LexerVisitor } from "lexer/lexer.visitor";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class SemicolonToken extends NjsBaseToken<undefined> {
  readonly type = "semicolon";

  constructor() {
    super(undefined);
  }
}

export class SemicolonHandler extends NjsBaseHandler<undefined> {
  public static readonly semicolon = ";";

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<undefined> {
    if (visitor.accept(SemicolonHandler.semicolon)) {
      visitor.pop();

      return {
        token: new SemicolonToken(),
      };
    }

    return {};
  }
}
