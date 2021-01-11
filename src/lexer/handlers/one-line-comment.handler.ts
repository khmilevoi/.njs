import { NjsVisitor } from "../../shared/visitor.shared";
import { NjsBaseHandler, NjsLexerHandlerLexemeDescriptor } from "../types";

export class OneLineCommentHandler extends NjsBaseHandler<string> {
  public static readonly start = "//";
  public static readonly end = "\n";

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (visitor.pop().concat(visitor.peep()) === OneLineCommentHandler.start) {
      visitor.pop();

      while (visitor.notAccept(OneLineCommentHandler.end)) {
        visitor.pop();
      }
    } else {
      visitor.revert();
    }

    return {};
  }
}
