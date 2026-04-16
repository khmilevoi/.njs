import { NjsAstNode } from "parser/types";
import { Executor } from "./executor";

export interface NjsExecutor {
  execute(ast: NjsAstNode): any;
}

export abstract class NjsBaseExecutor<T extends NjsAstNode = NjsAstNode, R = any> {
  protected executor!: Executor;

  setExecutor(executor: Executor) {
    this.executor = executor;
  }

  executeAll(node: NjsAstNode): any {
    return this.executor.execute(node);
  }

  abstract cast(node: NjsAstNode): node is T;

  abstract execute(node: T): R;
}

export abstract class NjsStatementExecutor<
  T extends NjsAstNode = NjsAstNode,
> extends NjsBaseExecutor<T, void> {}

export abstract class NjsExpressionExecutor<
  T extends NjsAstNode = NjsAstNode,
  R = any,
> extends NjsBaseExecutor<T, R> {}
