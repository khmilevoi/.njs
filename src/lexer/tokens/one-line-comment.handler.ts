import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerDescriptor,
  NjsLexerHandlerLexemeDescriptor,
  NjsToken,
} from "../types";

export class OneLineCommentToken extends NjsBaseToken {
  readonly type = "comment";

  constructor(inner: string, private readonly divider: string) {
    super(inner);
  }

  toString(): string {
    return this.divider + this.inner;
  }
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

      if (lexeme === this.end) {
        descriptor.token = new OneLineCommentToken(this.inner, this.divider);
        this.stopProcessing();
        this.cleanInner();
      }
    } else {
      if (lexeme === this.divider[0]) {
        descriptor.block = true;
      }

      if (
        previousLexemes === this.divider[0] &&
        previousLexemes.concat(lexeme) !== this.divider
      ) {
        descriptor.reset = true;
        descriptor.block = true;
      }

      if (previousLexemes.concat(lexeme) === this.divider) {
        descriptor.block = true;
        this.startProcessing();
      }
    }

    return descriptor;
  }
}
