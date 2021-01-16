import { NjsToken } from "lexer/types";
import { Expression } from "parser/parser.espression";
import { Instruction } from "parser/parser.instraction";
import { ParserVisitor } from "parser/parser.visitor";
import {
  ExpressionHandler,
  InstructionHandler,
  NjsAstTree,
  NjsParser,
  NjsParserHandler,
} from "parser/types";
import { NjsTarget } from "shared/visitor.shared";

export class Parser implements NjsParser, NjsTarget<NjsToken<any>> {
  private readonly handlers: NjsParserHandler[] = [];
  private readonly visitor = new ParserVisitor(this);
  private iterator = 0;
  private tokens: NjsToken<any>[] = [];

  constructor(...handlers: NjsParserHandler[]) {
    this.handlers.push(...handlers);

    new Expression(
      handlers.filter((handler) => handler instanceof ExpressionHandler)
    );
    new Instruction(
      handlers.filter((handler) => handler instanceof InstructionHandler)
    );
  }

  parse(tokens: NjsToken<any>[]): NjsAstTree {
    this.tokens = tokens;

    return undefined as any;
  }

  getLine(): number {
    return 0;
  }

  revert(amount?: number): void {}

  peep(): NjsToken<any> {
    return this.tokens[this.iterator];
  }

  pop(): NjsToken<any> {
    const prev = this.tokens[this.iterator];

    if (this.iterator < this.tokens.length) {
      this.iterator += 1;
    }

    return prev;
  }
}
