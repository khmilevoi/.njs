import {
  NjsBaseToken,
  NjsBaseHandler,
  NjsLexerHandlerDescriptor,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class OneLineCommentToken extends NjsBaseToken {
  readonly type = "one-line-comment";
}

export class OneLineCommentHandler extends NjsBaseHandler {
  readonly descriptor: NjsLexerHandlerDescriptor = {
    previous: 1,
  };

  private readonly end = "\n";

  constructor(private readonly divider: string) {
    super();
  }

  read(
    lexeme: string,
    previousTokens: NjsToken[],
    previousLexemes: string
  ): NjsLexerHandlerLexemeDescriptor {
    const descriptor = this.createDescriptor();

    if (this.processing) {
      descriptor.block = true;
      this.updateInner(lexeme);
    }

    if (lexeme === this.end && this.processing) {
      descriptor.block = true;
      descriptor.token = new OneLineCommentToken(this.inner);
      this.stopProcessing();
      this.cleanInner();
    } else if (
      previousLexemes.concat(lexeme) === this.divider &&
      !this.processing
    ) {
      descriptor.block = true;
      this.startProcessing();
    }

    return descriptor;
  }
}
