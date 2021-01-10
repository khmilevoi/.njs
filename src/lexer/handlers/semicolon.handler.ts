import { NjsVisitor } from "../../shared/visitor.shared";
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

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<never> {
    if (visitor.peep() === SemicolonHandler.semicolon) {
      visitor.pop();

      return {
        token: new SemicolonToken(),
      };
    }

    return {};
  }
}
