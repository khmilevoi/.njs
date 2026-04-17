import { NjsAstNode } from "parser/types";
import { ExecutorVisitor } from "./executor.visitor";

export interface NjsExecutor {
  execute(ast: NjsAstNode, visitor: ExecutorVisitor): any;
}

export abstract class NjsBaseExecutor<T extends NjsAstNode = NjsAstNode, R = any> {
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
