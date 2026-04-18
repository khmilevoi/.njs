import { NjsAstNode } from "parser/types";
import { ScopeManager, NjsValue } from "./scope";
import { NjsExecutor } from "./types";

export class ExecutorVisitor {
  constructor(
    private readonly executor: NjsExecutor,
    public readonly scope: ScopeManager,
  ) {}

  execute(node: NjsAstNode): NjsValue {
    return this.executor.execute(node, this);
  }
}
