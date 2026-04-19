import { LexerVisitor } from "lexer/lexer.visitor";

export interface NjsToken<Inner> {
  readonly skip?: boolean;
  readonly type: string;
  readonly inner: Inner;

  toString(): string;
}

export abstract class NjsBaseToken<Inner> implements NjsToken<Inner> {
  readonly skip?: boolean;
  abstract readonly type: string;

  constructor(public readonly inner: Inner) {}

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
