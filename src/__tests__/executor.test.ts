import { Executor } from "executor";
import { NjsValue } from "executor/scope/types";
import {
  NjsExpressionExecutor,
  NjsStatementExecutor,
  ExecutorVisitor,
  ScopeManager,
} from "executor";
import { NjsAstNode } from "parser/types";

// --- AST Nodes ---

class NumberLiteral implements NjsAstNode {
  constructor(public value: number) {}
}

class Identifier implements NjsAstNode {
  constructor(public name: string) {}
}

class BinaryExpression implements NjsAstNode {
  constructor(
    public left: NjsAstNode,
    public operator: "+" | "-" | "*" | "/" | "<" | ">" | "==",
    public right: NjsAstNode,
  ) {}
}

class VariableDeclaration implements NjsAstNode {
  constructor(
    public name: string,
    public init: NjsAstNode,
  ) {}
}

class AssignmentExpression implements NjsAstNode {
  constructor(
    public name: string,
    public value: NjsAstNode,
  ) {}
}

class BlockStatement implements NjsAstNode {
  constructor(public statements: NjsAstNode[]) {}
}

class IfStatement implements NjsAstNode {
  constructor(
    public condition: NjsAstNode,
    public consequent: NjsAstNode,
    public alternate?: NjsAstNode,
  ) {}
}

class ForStatement implements NjsAstNode {
  constructor(
    public init: NjsAstNode,
    public condition: NjsAstNode,
    public update: NjsAstNode,
    public body: NjsAstNode,
  ) {}
}

class UnknownNode implements NjsAstNode {
  type = "UnknownNode";
}

// --- Executors ---

class NumberLiteralExecutor extends NjsExpressionExecutor<NumberLiteral, number> {
  cast(node: NjsAstNode): node is NumberLiteral {
    return node instanceof NumberLiteral;
  }

  execute(node: NumberLiteral, visitor: ExecutorVisitor): number {
    return node.value;
  }
}

class IdentifierExecutor extends NjsExpressionExecutor<Identifier, NjsValue> {
  cast(node: NjsAstNode): node is Identifier {
    return node instanceof Identifier;
  }

  execute(node: Identifier, visitor: ExecutorVisitor): NjsValue {
    return visitor.scope.get(node.name);
  }
}

class BinaryExpressionExecutor extends NjsExpressionExecutor<BinaryExpression, NjsValue> {
  cast(node: NjsAstNode): node is BinaryExpression {
    return node instanceof BinaryExpression;
  }

  execute(node: BinaryExpression, visitor: ExecutorVisitor): NjsValue {
    const left = visitor.execute(node.left) as any;
    const right = visitor.execute(node.right) as any;

    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "==":
        return left === right;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }
}

class VariableDeclarationExecutor extends NjsStatementExecutor<VariableDeclaration> {
  cast(node: NjsAstNode): node is VariableDeclaration {
    return node instanceof VariableDeclaration;
  }

  execute(node: VariableDeclaration, visitor: ExecutorVisitor): void {
    const value = visitor.execute(node.init);
    // Use apply from scope if needed, or set
    visitor.scope.set(node.name, value);
  }
}

class AssignmentExpressionExecutor extends NjsExpressionExecutor<AssignmentExpression, NjsValue> {
  cast(node: NjsAstNode): node is AssignmentExpression {
    return node instanceof AssignmentExpression;
  }

  execute(node: AssignmentExpression, visitor: ExecutorVisitor): NjsValue {
    const value = visitor.execute(node.value);
    visitor.scope.set(node.name, value);
    return value; // assignments are expressions
  }
}

class BlockStatementExecutor extends NjsStatementExecutor<BlockStatement> {
  cast(node: NjsAstNode): node is BlockStatement {
    return node instanceof BlockStatement;
  }

  execute(node: BlockStatement, visitor: ExecutorVisitor): void {
    visitor.scope.push();
    for (const statement of node.statements) {
      visitor.execute(statement);
    }
    visitor.scope.pop();
  }
}

class IfStatementExecutor extends NjsStatementExecutor<IfStatement> {
  cast(node: NjsAstNode): node is IfStatement {
    return node instanceof IfStatement;
  }

  execute(node: IfStatement, visitor: ExecutorVisitor): void {
    const conditionResult = visitor.execute(node.condition);
    if (conditionResult) {
      visitor.execute(node.consequent);
    } else if (node.alternate) {
      visitor.execute(node.alternate);
    }
  }
}

class ForStatementExecutor extends NjsStatementExecutor<ForStatement> {
  cast(node: NjsAstNode): node is ForStatement {
    return node instanceof ForStatement;
  }

  execute(node: ForStatement, visitor: ExecutorVisitor): void {
    visitor.scope.push();
    if (node.init) {
      visitor.execute(node.init);
    }

    while (true) {
      if (node.condition) {
        const conditionResult = visitor.execute(node.condition);
        if (!conditionResult) {
          break;
        }
      }

      visitor.execute(node.body);

      if (node.update) {
        visitor.execute(node.update);
      }
    }
    visitor.scope.pop();
  }
}

// --- Tests ---

describe("Executor (Realistic AST)", () => {
  let scopeManager: ScopeManager;
  let executor: Executor;
  let visitor: ExecutorVisitor;

  beforeEach(() => {
    scopeManager = new ScopeManager();
    executor = new Executor(
      new NumberLiteralExecutor(),
      new IdentifierExecutor(),
      new BinaryExpressionExecutor(),
      new VariableDeclarationExecutor(),
      new AssignmentExpressionExecutor(),
      new BlockStatementExecutor(),
      new IfStatementExecutor(),
      new ForStatementExecutor(),
    );
    visitor = new ExecutorVisitor(executor, scopeManager);
  });

  it("should return null for an unknown AST node", () => {
    expect(visitor.execute(new UnknownNode())).toBeNull();
  });

  it("should evaluate a simple expression", () => {
    // 5 + 3
    const ast = new BinaryExpression(new NumberLiteral(5), "+", new NumberLiteral(3));

    const result = visitor.execute(ast);
    expect(result).toBe(8);
  });

  it("should evaluate subtraction, multiplication, division, and equality", () => {
    expect(
      visitor.execute(new BinaryExpression(new NumberLiteral(5), "-", new NumberLiteral(3))),
    ).toBe(2);
    expect(
      visitor.execute(new BinaryExpression(new NumberLiteral(5), "*", new NumberLiteral(3))),
    ).toBe(15);
    expect(
      visitor.execute(new BinaryExpression(new NumberLiteral(6), "/", new NumberLiteral(3))),
    ).toBe(2);
    expect(
      visitor.execute(new BinaryExpression(new NumberLiteral(5), "==", new NumberLiteral(5))),
    ).toBe(true);

    // Test unknown operator to hit default switch case
    expect(() =>
      visitor.execute(new BinaryExpression(new NumberLiteral(5), "!" as any, new NumberLiteral(3))),
    ).toThrow("Unknown operator: !");
  });

  it("should execute a variable declaration", () => {
    // let x = 10;
    const ast = new VariableDeclaration("x", new NumberLiteral(10));

    visitor.execute(ast);
    expect(visitor.scope.get("x")).toBe(10);
  });

  it("should execute an if statement", () => {
    visitor.execute(new VariableDeclaration("result", new NumberLiteral(0)));
    visitor.execute(new VariableDeclaration("x", new NumberLiteral(10)));

    const ast = new IfStatement(
      new BinaryExpression(new Identifier("x"), ">", new NumberLiteral(5)),
      new BlockStatement([new AssignmentExpression("result", new NumberLiteral(1))]),
      new BlockStatement([new AssignmentExpression("result", new NumberLiteral(2))]),
    );

    visitor.execute(ast);
    expect(visitor.scope.get("result")).toBe(1);

    // Now test alternate branch
    visitor.execute(new AssignmentExpression("x", new NumberLiteral(2)));
    visitor.execute(ast);
    expect(visitor.scope.get("result")).toBe(2);
  });

  it("should execute an if statement without alternate branch", () => {
    visitor.execute(new VariableDeclaration("result", new NumberLiteral(0)));
    visitor.execute(new VariableDeclaration("x", new NumberLiteral(10)));

    const ast = new IfStatement(
      new BinaryExpression(new Identifier("x"), ">", new NumberLiteral(5)),
      new AssignmentExpression("result", new NumberLiteral(1)),
    );

    visitor.execute(ast);
    expect(visitor.scope.get("result")).toBe(1);

    visitor.execute(new AssignmentExpression("x", new NumberLiteral(2)));
    visitor.execute(new AssignmentExpression("result", new NumberLiteral(0)));
    visitor.execute(ast);
    expect(visitor.scope.get("result")).toBe(0); // Should not execute consequence
  });

  it("should execute a for loop", () => {
    visitor.execute(new VariableDeclaration("sum", new NumberLiteral(0)));

    const ast = new ForStatement(
      new VariableDeclaration("i", new NumberLiteral(0)), // init
      new BinaryExpression(new Identifier("i"), "<", new NumberLiteral(5)), // condition
      new AssignmentExpression(
        "i",
        new BinaryExpression(new Identifier("i"), "+", new NumberLiteral(1)),
      ), // update
      new BlockStatement([
        // body
        new AssignmentExpression(
          "sum",
          new BinaryExpression(new Identifier("sum"), "+", new Identifier("i")),
        ),
      ]),
    );

    visitor.execute(ast);

    // sum = 0 + 1 + 2 + 3 + 4 = 10
    expect(visitor.scope.get("sum")).toBe(10);
    // since i was declared in the loop, we check if scope pop worked
    expect(() => visitor.scope.get("i")).toThrow();
  });

  it("should handle identifier not found gracefully or throw", () => {
    const ast = new Identifier("unknown_var");
    expect(() => visitor.execute(ast)).toThrow("Variable 'unknown_var' is not defined");
  });
});
