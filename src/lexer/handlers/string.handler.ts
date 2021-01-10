import { NjsVisitor } from "../../shared/visitor.shared";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class StringToken extends NjsBaseToken<string> {
  readonly type = "string";

  constructor(inner: string) {
    super(inner);
  }

  toString(): string {
    return StringHandler.divider + this.inner + StringHandler.divider;
  }
}

export class StringHandler extends NjsBaseHandler<string> {
  public static readonly divider = '"';

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (visitor.peep() === StringHandler.divider) {
      visitor.pop();

      let inner = visitor.pop();

      while (visitor.peep() != StringHandler.divider) {
        inner += visitor.pop();
      }

      visitor.pop();

      return {
        token: new StringToken(inner),
      };
    }

    return {};
  }
}
