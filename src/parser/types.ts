import { NjsToken } from "lexer/types";
import { ParserError } from "parser/parser.error";
import { ParserVisitor } from "parser/parser.visitor";

export interface NjsAstTree {}

export interface NjsParser {
  parse(tokens: NjsToken<any>[]): NjsAstTree;
}

export interface NjsTerminal {
  handle(visitor: ParserVisitor): NjsAstTree | null;
}

export abstract class NjsBaseTerminal implements NjsTerminal {
  abstract handle(visitor: ParserVisitor): NjsAstTree | null;
}

export abstract class BaseTerminalHelper extends NjsBaseTerminal {
  protected readonly terminals: NjsTerminal[] = [];

  constructor(...terminals: NjsTerminal[]) {
    super();

    this.terminals.push(...terminals);
  }
}

export interface NjsParserHandler {
  readonly grammar: (NjsBaseTerminal | string | RegExp)[];

  handle(visitor: ParserVisitor): NjsAstTree;
}

export abstract class NjaBaseParserHandler implements NjsParserHandler {
  abstract grammar: (NjsBaseTerminal | string | RegExp)[] = [];

  abstract handle(visitor: ParserVisitor): NjsAstTree;

  protected execute(
    visitor: ParserVisitor
  ): (NjsToken<any> | NjsAstTree | null)[] {
    return this.grammar.map((item) => {
      if (item instanceof RegExp && item.test(visitor.peep().inner)) {
        return visitor.pop();
      }

      if (typeof item === "string" && item === visitor.peep().inner) {
        return visitor.pop();
      }

      if (item instanceof NjsBaseTerminal) {
        return item.handle(visitor);
      }

      throw new ParserError(
        `{internal} invalid grammar in ${this.constructor.name}`
      );
    });
  }
}

export abstract class ExpressionHandler extends NjaBaseParserHandler {}

export abstract class InstructionHandler extends NjaBaseParserHandler {}
