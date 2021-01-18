import { NjsToken } from "lexer/types";

export interface NjsAstTree {}

export interface NjsParser {
  parse(tokens: NjsToken<any>[]): NjsAstTree;
}

export interface NjsParserHandler {}

export class ExpressionHandler implements NjsParserHandler {}

export class InstructionHandler implements NjsParserHandler {}