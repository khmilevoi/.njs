import { NjsToken } from "lexer/types";

export interface NjsAstTree {}

export interface NjsParser {
  parse(tokens: NjsToken<any>[]): NjsAstTree;
}
