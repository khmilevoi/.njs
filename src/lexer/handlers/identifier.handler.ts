import { NjsVisitor } from "../../shared/visitor.shared";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class IdentifierToken extends NjsBaseToken<string> {
  readonly type = "identifier";
}

export class IdentifierHandler extends NjsBaseHandler<string> {
  public static readonly pattern = /^[a-zA-Z]\w*$/;
  private readonly firstLetter = /[a-zA-Z]/;

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (this.firstLetter.test(visitor.peep())) {
      let inner = "";

      while (this.firstLetter.test(visitor.peep())) {
        inner += visitor.pop();

        if (!IdentifierHandler.pattern.test(inner)) {
          return {};
        }
      }

      return {
        token: new IdentifierToken(inner),
      };
    }

    return {};
  }
}
