import { Executor } from "executor";
import { NjsExpressionExecutor, NjsStatementExecutor } from "executor/types";
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

// --- Environment for state mutation ---
class Environment {
  variables: Record<string, any> = {};

  get(name: string) {
    if (!(name in this.variables)) {
      throw new Error(`Undefined variable: ${name}`);
    }
    return this.variables[name];
  }

  set(name: string, value: any) {
    this.variables[name] = value;
  }
}

// --- Executors ---

class NumberLiteralExecutor extends NjsExpressionExecutor<NumberLiteral, number> {
  cast(node: NjsAstNode): node is NumberLiteral {
    return node instanceof NumberLiteral;
  }

  execute(node: NumberLiteral): number {
    return node.value;
  }
}

class IdentifierExecutor extends NjsExpressionExecutor<Identifier, any> {
  constructor(private env: Environment) {
    super();
  }

  cast(node: NjsAstNode): node is Identifier {
    return node instanceof Identifier;
  }

  execute(node: Identifier): any {
    return this.env.get(node.name);
  }
}

class BinaryExpressionExecutor extends NjsExpressionExecutor<BinaryExpression, any> {
  cast(node: NjsAstNode): node is BinaryExpression {
    return node instanceof BinaryExpression;
  }

  execute(node: BinaryExpression): any {
    const left = this.executeAll(node.left);
    const right = this.executeAll(node.right);

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
  constructor(private env: Environment) {
    super();
  }

  cast(node: NjsAstNode): node is VariableDeclaration {
    return node instanceof VariableDeclaration;
  }

  execute(node: VariableDeclaration): void {
    const value = this.executeAll(node.init);
    this.env.set(node.name, value);
  }
}

class AssignmentExpressionExecutor extends NjsExpressionExecutor<AssignmentExpression, any> {
  constructor(private env: Environment) {
    super();
  }

  cast(node: NjsAstNode): node is AssignmentExpression {
    return node instanceof AssignmentExpression;
  }

  execute(node: AssignmentExpression): any {
    const value = this.executeAll(node.value);
    this.env.set(node.name, value);
    return value; // assignments are expressions
  }
}

class BlockStatementExecutor extends NjsStatementExecutor<BlockStatement> {
  cast(node: NjsAstNode): node is BlockStatement {
    return node instanceof BlockStatement;
  }

  execute(node: BlockStatement): void {
    for (const statement of node.statements) {
      this.executeAll(statement);
    }
  }
}

class IfStatementExecutor extends NjsStatementExecutor<IfStatement> {
  cast(node: NjsAstNode): node is IfStatement {
    return node instanceof IfStatement;
  }

  execute(node: IfStatement): void {
    const conditionResult = this.executeAll(node.condition);
    if (conditionResult) {
      this.executeAll(node.consequent);
    } else if (node.alternate) {
      this.executeAll(node.alternate);
    }
  }
}

class ForStatementExecutor extends NjsStatementExecutor<ForStatement> {
  cast(node: NjsAstNode): node is ForStatement {
    return node instanceof ForStatement;
  }

  execute(node: ForStatement): void {
    if (node.init) {
      this.executeAll(node.init);
    }

    while (true) {
      if (node.condition) {
        const conditionResult = this.executeAll(node.condition);
        if (!conditionResult) {
          break;
        }
      }

      this.executeAll(node.body);

      if (node.update) {
        this.executeAll(node.update);
      }
    }
  }
}

// --- Tests ---

describe("Executor (Realistic AST)", () => {
  let env: Environment;
  let executor: Executor;

  beforeEach(() => {
    env = new Environment();
    executor = new Executor(
      new NumberLiteralExecutor(),
      new IdentifierExecutor(env),
      new BinaryExpressionExecutor(),
      new VariableDeclarationExecutor(env),
      new AssignmentExpressionExecutor(env),
      new BlockStatementExecutor(),
      new IfStatementExecutor(),
      new ForStatementExecutor(),
    );
  });

  it("should return null for an unknown AST node", () => {
    expect(executor.execute(new UnknownNode())).toBeNull();
  });

  it("should evaluate a simple expression", () => {
    // 5 + 3
    const ast = new BinaryExpression(new NumberLiteral(5), "+", new NumberLiteral(3));

    const result = executor.execute(ast);
    expect(result).toBe(8);
  });

  it("should evaluate subtraction, multiplication, division, and equality", () => {
    expect(
      executor.execute(new BinaryExpression(new NumberLiteral(5), "-", new NumberLiteral(3))),
    ).toBe(2);
    expect(
      executor.execute(new BinaryExpression(new NumberLiteral(5), "*", new NumberLiteral(3))),
    ).toBe(15);
    expect(
      executor.execute(new BinaryExpression(new NumberLiteral(6), "/", new NumberLiteral(3))),
    ).toBe(2);
    expect(
      executor.execute(new BinaryExpression(new NumberLiteral(5), "==", new NumberLiteral(5))),
    ).toBe(true);

    // Test unknown operator to hit default switch case
    expect(() =>
      executor.execute(
        new BinaryExpression(new NumberLiteral(5), "!" as any, new NumberLiteral(3)),
      ),
    ).toThrow("Unknown operator: !");
  });

  it("should execute a variable declaration", () => {
    // let x = 10;
    const ast = new VariableDeclaration("x", new NumberLiteral(10));

    executor.execute(ast);
    expect(env.get("x")).toBe(10);
  });

  it("should execute an if statement", () => {
    // let result = 0;
    // let x = 10;
    // if (x > 5) { result = 1; } else { result = 2; }

    executor.execute(new VariableDeclaration("result", new NumberLiteral(0)));
    executor.execute(new VariableDeclaration("x", new NumberLiteral(10)));

    const ast = new IfStatement(
      new BinaryExpression(new Identifier("x"), ">", new NumberLiteral(5)),
      new BlockStatement([new AssignmentExpression("result", new NumberLiteral(1))]),
      new BlockStatement([new AssignmentExpression("result", new NumberLiteral(2))]),
    );

    executor.execute(ast);
    expect(env.get("result")).toBe(1);

    // Now test alternate branch
    executor.execute(new AssignmentExpression("x", new NumberLiteral(2)));
    executor.execute(ast);
    expect(env.get("result")).toBe(2);
  });

  it("should execute an if statement without alternate branch", () => {
    executor.execute(new VariableDeclaration("result", new NumberLiteral(0)));
    executor.execute(new VariableDeclaration("x", new NumberLiteral(10)));

    const ast = new IfStatement(
      new BinaryExpression(new Identifier("x"), ">", new NumberLiteral(5)),
      new AssignmentExpression("result", new NumberLiteral(1)),
    );

    executor.execute(ast);
    expect(env.get("result")).toBe(1);

    executor.execute(new AssignmentExpression("x", new NumberLiteral(2)));
    executor.execute(new AssignmentExpression("result", new NumberLiteral(0)));
    executor.execute(ast);
    expect(env.get("result")).toBe(0); // Should not execute consequence
  });

  it("should execute a for loop", () => {
    // let sum = 0;
    // for (let i = 0; i < 5; i = i + 1) {
    //   sum = sum + i;
    // }

    executor.execute(new VariableDeclaration("sum", new NumberLiteral(0)));

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

    executor.execute(ast);

    // sum = 0 + 1 + 2 + 3 + 4 = 10
    expect(env.get("sum")).toBe(10);
    // i should be 5 after the loop terminates
    expect(env.get("i")).toBe(5);
  });

  it("should handle identifier not found gracefully or throw", () => {
    const ast = new Identifier("unknown_var");
    expect(() => executor.execute(ast)).toThrow("Undefined variable: unknown_var");
  });
});
