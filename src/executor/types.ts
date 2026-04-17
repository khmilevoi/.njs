import { NjsAstNode } from "parser/types";
import { ExecutorVisitor } from "./executor.visitor";

export interface NjsExecutor {
  execute(ast: NjsAstNode, visitor: ExecutorVisitor): any;
}

export abstract class NjsBaseExecutor<T extends NjsAstNode = NjsAstNode, R = any> {
  protected visitor!: ExecutorVisitor;

  // We keep setExecutor to wire up backwards compatibility or directly use the visitor
  // However, the visitor handles everything, so maybe handlers just need execute(node, visitor).
  // But we can keep an executeAll on the base that relies on the passed-in visitor.

  executeAll(node: NjsAstNode, visitor: ExecutorVisitor): any {
    return visitor.execute(node);
  }

  abstract cast(node: NjsAstNode): node is T;

  abstract execute(node: T, visitor: ExecutorVisitor): R;
}

export abstract class NjsStatementExecutor<
  T extends NjsAstNode = NjsAstNode,
> extends NjsBaseExecutor<T, void> {}

export abstract class NjsExpressionExecutor<
  T extends NjsAstNode = NjsAstNode,
  R = any,
> extends NjsBaseExecutor<T, R> {}
