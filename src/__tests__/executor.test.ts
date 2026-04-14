import { Executor } from "executor";
import { NjsBaseExecutor } from "executor/types";
import { NjsAstNode } from "parser/types";

class TestNodeA implements NjsAstNode {
  type = "NodeA";
  constructor(public value: string) {}
}

class TestNodeB implements NjsAstNode {
  type = "NodeB";
  constructor(public child: NjsAstNode) {}
}

class ExecutorA extends NjsBaseExecutor<TestNodeA> {
  cast(node: NjsAstNode): node is TestNodeA {
    return node instanceof TestNodeA;
  }

  execute(node: TestNodeA) {
    return `Executed A: ${node.value}`;
  }
}

class ExecutorB extends NjsBaseExecutor<TestNodeB> {
  cast(node: NjsAstNode): node is TestNodeB {
    return node instanceof TestNodeB;
  }

  execute(node: TestNodeB) {
    const childResult = this.executeAll(node.child);
    return `Executed B -> ${childResult}`;
  }
}

describe("Executor", () => {
  it("should execute node correctly based on matching handler", () => {
    const executor = new Executor(new ExecutorA());
    const node = new TestNodeA("test_val");

    const result = executor.execute(node);
    expect(result).toBe("Executed A: test_val");
  });

  it("should return null if no handler matches", () => {
    const executor = new Executor(new ExecutorA());
    const node = new TestNodeB(new TestNodeA("test"));

    const result = executor.execute(node);
    expect(result).toBeNull();
  });

  it("should execute nested nodes correctly via executeAll", () => {
    const executor = new Executor(new ExecutorA(), new ExecutorB());
    const node = new TestNodeB(new TestNodeA("nested_val"));

    const result = executor.execute(node);
    expect(result).toBe("Executed B -> Executed A: nested_val");
  });
});
