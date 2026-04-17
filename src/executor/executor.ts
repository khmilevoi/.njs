import { NjsAstNode } from "parser/types";
import { NjsBaseExecutor, NjsExecutor } from "./types";
import { ExecutorVisitor } from "./executor.visitor";

export class Executor implements NjsExecutor {
  private readonly handlers: NjsBaseExecutor<any>[] = [];

  constructor(...handlers: NjsBaseExecutor<any>[]) {
    this.handlers = handlers;
  }

  execute(ast: NjsAstNode, visitor: ExecutorVisitor): any {
    for (const handler of this.handlers) {
      if (handler.cast(ast)) {
        return handler.execute(ast, visitor);
      }
    }

    return null;
  }
}
