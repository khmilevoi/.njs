import { NjsTarget, NjsVisitor } from "../shared/visitor.shared";
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
  private visitor = new NjsVisitor(this);

  constructor(...handlers: NjsHandler<any>[]) {
    this.handlers = [...Lexer.defaultHandlers, ...handlers];
  }

  peep() {
    return this.lexemes[this.iterator];
  }

  pop() {
    return this.lexemes[this.iterator++];
  }

  revert(amount?: number) {
    if (amount == null) {
      this.iterator = this.savedIterator;
    } else {
      this.iterator -= amount;
    }
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
