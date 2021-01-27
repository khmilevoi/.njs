import { NjsToken } from "lexer/types";

export interface NjsAstNode {
  child: NjsAstNode;
}

export interface NjsAstTree {
  root?: NjsAstNode;
}

export interface NjsParser {
  parse(tokens: Generator<NjsToken<any>>): NjsAstTree;
}

export interface NjsParserHandler {
  grammar: NjsParserHandler[];
}
