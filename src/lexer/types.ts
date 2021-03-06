import { LexerVisitor } from "lexer/lexer.visitor";

export interface NjsToken<Inner> {
  readonly type: string;
  readonly inner?: Inner;

  toString(): string;
}

export abstract class NjsBaseToken<Inner> implements NjsToken<Inner> {
  abstract readonly type: string = "base";

  constructor(public readonly inner?: Inner) {}

  toString(): string {
    return `${this.inner}`;
  }
}

export interface NjsLexerHandlerLexemeDescriptor<Inner> {
  token?: NjsToken<Inner>;
}

export interface NjsLexerHandlerDescriptor {}

export interface NjsHandler<Inner> {
  descriptor: NjsLexerHandlerDescriptor;

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<Inner>;
}

export abstract class NjsBaseHandler<Inner> implements NjsHandler<Inner> {
  descriptor: NjsLexerHandlerDescriptor = {};

  abstract read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<Inner>;
}

export interface NjsLexer {
  run(source: string): NjsToken<any>[];
}
