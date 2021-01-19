import { NjsToken } from "lexer/types";
import { RootHandler } from "parser/handlers/instructions/root.handler";
import { ParserVisitor } from "parser/parser.visitor";
import { Expression } from "parser/terminals/exspression.terminal";
import { Instruction } from "parser/terminals/instruction.terminal";
import {
  ExpressionHandler,
  InstructionHandler,
  NjaBaseParserHandler,
  NjsAstTree,
  NjsParser,
} from "parser/types";
import { NjsTarget } from "shared/visitor.shared";

export class Parser implements NjsParser, NjsTarget<NjsToken<any>> {
  private readonly handlers: NjaBaseParserHandler[] = [new RootHandler()];
  private readonly visitor = new ParserVisitor(this);
  private iterator = 0;
  private tokens: NjsToken<any>[] = [];

  constructor(...handlers: NjaBaseParserHandler[]) {
    this.handlers.push(...handlers);

    new Expression(
      ...this.handlers.filter((handler) => handler instanceof ExpressionHandler)
    );
    new Instruction(
      ...this.handlers.filter(
        (handler) => handler instanceof InstructionHandler
      )
    );
  }

  parse(tokens: NjsToken<any>[]): NjsAstTree {
    this.tokens = tokens;

    const result = this.handlers.map((handler) => handler.handle(this.visitor));

    return result as any;
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
