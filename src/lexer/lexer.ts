import { LexerVisitor } from "lexer/lexer.visitor";
import { NjsTarget } from "shared/visitor.shared";
import { NewLineToken } from "./handlers/new-line.handler";
import { OneLineCommentHandler } from "./handlers/one-line-comment.handler";
import { SpaceHandler } from "./handlers/space.handler";
import { NjsHandler, NjsLexer, NjsToken } from "./types";

export class Lexer implements NjsLexer, NjsTarget {
  private static readonly defaultHandlers: NjsHandler<any>[] = [
    new SpaceHandler(),
    new OneLineCommentHandler(),
  ];
  private readonly handlers: NjsHandler<any>[];

  private readonly tokens: NjsToken<any>[] = [];
  private lexemes: string = "";
  private savedIterator = 0;
  private iterator = 0;
  private line = 1;
  private visitor = new LexerVisitor(this);

  constructor(...handlers: NjsHandler<any>[]) {
    this.handlers = [...Lexer.defaultHandlers, ...handlers];
  }

  peep(): string {
    return this.lexemes[this.iterator];
  }

  pop(): string {
    const prev = this.lexemes[this.iterator];

    if (this.iterator < this.lexemes.length) {
      this.iterator += 1;
    }

    return prev;
  }

  revert(amount?: number) {
    if (amount == null) {
      this.iterator = this.savedIterator;
    } else {
      this.iterator -= amount;
    }
  }

  upLine() {
    return ++this.line;
  }

  getLine() {
    return this.line;
  }

  run(source: string): NjsToken<any>[] {
    this.lexemes = source;

    while (this.peep() != null) {
      const currentIterator = this.iterator;

      this.handlers.forEach((handler) => {
        if (this.peep() != null) {
          this.saveIterator();

          const descriptor = handler.read(this.visitor);

          if (descriptor.token) {
            if (descriptor.token instanceof NewLineToken) {
              this.upLine();
            }

            this.tokens.push(descriptor.token);
          }
        }
      });

      if (currentIterator === this.iterator) {
        this.pop();
      }
    }

    return this.tokens;
  }

  private saveIterator() {
    this.savedIterator = this.iterator;
  }
}
