import { NjsAstNode } from "parser/types";
import { ExecutorError } from "./executor.error";
import { NjsBaseExecutor, NjsExecutor } from "./types";

export class Executor implements NjsExecutor {
  private readonly handlers: NjsBaseExecutor<any>[] = [];

  constructor(...handlers: NjsBaseExecutor<any>[]) {
    this.handlers = handlers;

    // Wire up the circular dependency so handlers can call executeAll
    for (const handler of this.handlers) {
      handler.setExecutor(this);
    }
  }

  execute(ast: NjsAstNode): any {
    for (const handler of this.handlers) {
      if (handler.cast(ast)) {
        return handler.execute(ast);
      }
    }

    return null;
  }
}
