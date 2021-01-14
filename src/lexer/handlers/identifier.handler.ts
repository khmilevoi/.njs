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
  private readonly firstLetter = /\w/;

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (this.firstLetter.test(visitor.peep())) {
      let inner = "";

      while (visitor.accept(this.firstLetter)) {
        inner += visitor.pop();

        if (!IdentifierHandler.pattern.test(inner)) {
          visitor.revert();
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
