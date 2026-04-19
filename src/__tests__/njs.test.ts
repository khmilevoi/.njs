import fs from "fs";
import { describe, it, expect, vi } from "vitest";
import { Njs } from "../language/njs";
import { Lexer } from "../lexer/lexer";
import { StringHandler } from "../lexer/handlers/string.handler";
import { IdentifierHandler } from "../lexer/handlers/identifier.handler";
import { ServiceSymbolsHandler } from "../lexer/handlers/service-symbols.handler";
import { NumberHandler } from "../lexer/handlers/number.handler";
import { SpaceHandler } from "../lexer/handlers/space.handler";
import { NewLineHandler } from "../lexer/handlers/new-line.handler";
import { SemicolonHandler } from "../lexer/handlers/semicolon.handler";
import { Parser } from "../parser";
import { Executor } from "../executor";
import { Logger } from "../logger/logger";
import { ScopeManager } from "../executor/scope/scope-manager";
import { NjsAstNode, NjsBaseTerminal, NjsParserHandledItem, NjsGrammarItem } from "../parser/types";
import { OrHelper, LoopHelper, LoopNode } from "../parser/helpers/or.helper";
import { NjsToken } from "../lexer/types";
import { NjsExpressionExecutor, NjsStatementExecutor, ExecutorVisitor } from "../executor";
import { ReturnSignal, ControlFlowSignal } from "../executor/types";

// --- 1. AST Nodes ---
class NumberNode implements NjsAstNode {
  constructor(public value: number) {}
}

class IdentifierNode implements NjsAstNode {
  constructor(public name: string) {}
}

class BinaryExpressionNode implements NjsAstNode {
  constructor(
    public left: NjsAstNode,
    public op: string,
    public right: NjsAstNode,
  ) {}
}

class AssignmentNode implements NjsAstNode {
  constructor(
    public left: IdentifierNode,
    public right: NjsAstNode,
  ) {}
}

class BlockNode implements NjsAstNode {
  constructor(public statements: NjsAstNode[]) {}
}

class IfNode implements NjsAstNode {
  constructor(
    public condition: NjsAstNode,
    public body: BlockNode,
  ) {}
}

class WhileNode implements NjsAstNode {
  constructor(
    public condition: NjsAstNode,
    public body: BlockNode,
  ) {}
}

class FunctionDeclarationNode implements NjsAstNode {
  constructor(
    public name: string,
    public params: string[],
    public body: BlockNode,
  ) {}
}

class FunctionCallNode implements NjsAstNode {
  constructor(
    public name: string,
    public args: NjsAstNode[],
  ) {}
}

class ReturnNode implements NjsAstNode {
  constructor(public argument: NjsAstNode) {}
}

class ProgramNode implements NjsAstNode {
  constructor(public body: NjsAstNode[]) {}
}

// --- 2. Terminals ---
class NumberTerminal extends NjsBaseTerminal {
  get grammar() {
    return [/^([0-9]+(.[0-9]+)?)$/];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new NumberNode(Number((items[0] as any).inner));
  }
}
class IdentifierTerminal extends NjsBaseTerminal {
  get grammar() {
    return [/^[a-zA-Z_][a-zA-Z0-9_]*$/];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new IdentifierNode(String((items[0] as any).inner));
  }
}

class LazyTerminal extends NjsBaseTerminal {
  constructor(private getTerminal: () => NjsBaseTerminal) {
    super();
  }

  get grammar() {
    return [this.getTerminal()];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return items[0] as NjsAstNode;
  }
}

class AssignmentTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new IdentifierTerminal(), "=", new LazyTerminal(() => new ExprTerminal()), ";"];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new AssignmentNode(items[0] as IdentifierNode, items[2] as NumberNode);
  }
}

class PrimaryTerminal extends NjsBaseTerminal {
  get grammar() {
    return [
      new OrHelper(
        new LazyTerminal(() => new FunctionCallTerminal()),
        new NumberTerminal(),
        new IdentifierTerminal(),
      ),
    ];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[0] as NjsAstNode;
  }
}

class BinaryTerminal extends NjsBaseTerminal {
  get grammar() {
    return [
      new PrimaryTerminal(),
      new OrHelper("+", "-", "*", "/", "<", ">", "=="),
      new LazyTerminal(() => new ExprTerminal()),
    ];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new BinaryExpressionNode(
      items[0] as NjsAstNode,
      String((items[1] as any).inner),
      items[2] as NjsAstNode,
    );
  }
}

class ExprTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new OrHelper(new AssignmentTerminal(), new BinaryTerminal(), new PrimaryTerminal())];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[0] as NjsAstNode;
  }
}

class BlockTerminal extends NjsBaseTerminal {
  get grammar() {
    return ["{", new LoopHelper(new LazyTerminal(() => new StatementTerminal())), "}"];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new BlockNode((items[1] as LoopNode).nodes);
  }
}

class IfTerminal extends NjsBaseTerminal {
  get grammar() {
    return ["if", "(", new ExprTerminal(), ")", new BlockTerminal()];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new IfNode(items[2] as NjsAstNode, items[4] as BlockNode);
  }
}

class WhileTerminal extends NjsBaseTerminal {
  get grammar() {
    return ["while", "(", new ExprTerminal(), ")", new BlockTerminal()];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new WhileNode(items[2] as NjsAstNode, items[4] as BlockNode);
  }
}

class ReturnTerminal extends NjsBaseTerminal {
  get grammar() {
    return ["return", new ExprTerminal(), ";"];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new ReturnNode(items[1] as NjsAstNode);
  }
}

class BareExpressionTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new ExprTerminal(), ";"];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[0] as NjsAstNode;
  }
}

class ArgListTailTerminal extends NjsBaseTerminal {
  get grammar() {
    return [",", new IdentifierTerminal()];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[1] as NjsAstNode;
  }
}

class ArgListTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new IdentifierTerminal(), new LoopHelper(new ArgListTailTerminal())];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new LoopNode([items[0], ...(items[1] as LoopNode).nodes]);
  }
}

class FunctionDeclarationTerminal extends NjsBaseTerminal {
  get grammar() {
    return [
      "function",
      new IdentifierTerminal(),
      "(",
      new OrHelper(new ArgListTerminal(), ")"),
      new LazyTerminal(() => new FunctionBodyTerminal()),
    ];
  }
  protected parse(items: NjsParserHandledItem[]) {
    if (items.length === 5) {
      const argsNode = items[3] as LoopNode;
      const args = argsNode.nodes.map((n) => (n as IdentifierNode).name);
      return new FunctionDeclarationNode(
        (items[1] as IdentifierNode).name,
        args,
        items[4] as BlockNode,
      );
    } else {
      return new FunctionDeclarationNode(
        (items[1] as IdentifierNode).name,
        [],
        items[4] as BlockNode,
      );
    }
  }
}

class FunctionBodyTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new OrHelper(new BlockTerminal(), new LazyTerminal(() => new FakeBlockTerminal()))];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[0] as NjsAstNode;
  }
}

class FakeBlockTerminal extends NjsBaseTerminal {
  get grammar() {
    return [")", "{", new LoopHelper(new LazyTerminal(() => new StatementTerminal())), "}"];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new BlockNode((items[2] as LoopNode).nodes);
  }
}

class ExprListTailTerminal extends NjsBaseTerminal {
  get grammar() {
    return [",", new ExprTerminal()];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[1] as NjsAstNode;
  }
}

class ExprListTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new ExprTerminal(), new LoopHelper(new ExprListTailTerminal())];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new LoopNode([items[0], ...(items[1] as LoopNode).nodes]);
  }
}

class FunctionCallTerminal extends NjsBaseTerminal {
  get grammar() {
    return [
      new IdentifierTerminal(),
      "(",
      new OrHelper(new ExprListTerminal(), ")"),
      new LazyTerminal(() => new FunctionCallBodyTerminal()),
    ];
  }
  protected parse(items: NjsParserHandledItem[]) {
    if (items.length === 4) {
      return new FunctionCallNode((items[0] as IdentifierNode).name, (items[2] as LoopNode).nodes);
    } else {
      return new FunctionCallNode((items[0] as IdentifierNode).name, []);
    }
  }
}

class FunctionCallBodyTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new OrHelper(")", "")];
  }
  protected parse() {
    return new NumberNode(0);
  }
}

class StatementTerminal extends NjsBaseTerminal {
  get grammar() {
    return [
      new OrHelper(
        new AssignmentTerminal(),
        new IfTerminal(),
        new WhileTerminal(),
        new FunctionDeclarationTerminal(),
        new ReturnTerminal(),
        new BareExpressionTerminal(),
      ),
    ];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return items[0] as NjsAstNode;
  }
}

class ProgramTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new LoopHelper(new StatementTerminal())];
  }
  protected parse(items: NjsParserHandledItem[]) {
    return new ProgramNode((items[0] as LoopNode).nodes);
  }
}

// --- 3. Executors ---

class ReturnException extends Error {
  constructor(public value: any) {
    super("Return");
  }
}

class NumberExecutor extends NjsExpressionExecutor<NumberNode, number> {
  cast(node: NjsAstNode): node is NumberNode {
    return node instanceof NumberNode;
  }
  execute(node: NumberNode, visitor: ExecutorVisitor): number {
    return node.value;
  }
}

class IdentifierExecutor extends NjsExpressionExecutor<IdentifierNode, any> {
  cast(node: NjsAstNode): node is IdentifierNode {
    return node instanceof IdentifierNode;
  }
  execute(node: IdentifierNode, visitor: ExecutorVisitor): any {
    return visitor.scope.get(node.name);
  }
}

class BinaryExpressionExecutor extends NjsExpressionExecutor<BinaryExpressionNode, any> {
  cast(node: NjsAstNode): node is BinaryExpressionNode {
    return node instanceof BinaryExpressionNode;
  }
  execute(node: BinaryExpressionNode, visitor: ExecutorVisitor): any {
    const left = visitor.execute(node.left);
    const right = visitor.execute(node.right);
    // Since BinaryExpressionNode stores the operator as `operator` but our local AST node has `op`, let's map it safely!
    const op = (node as any).operator || (node as any).op;
    switch (op) {
      case "+":
        return (left as any) + (right as any);
      case "-":
        return (left as any) - (right as any);
      case "*":
        return (left as any) * (right as any);
      case "/":
        return (left as any) / (right as any);
      case "<":
        return (left as any) < (right as any);
      case ">":
        return (left as any) > (right as any);
      case "==":
        return left === right;
      default:
        return null;
    }
  }
}

class AssignmentExecutor extends NjsExpressionExecutor<AssignmentNode> {
  cast(node: NjsAstNode): node is AssignmentNode {
    return node instanceof AssignmentNode;
  }
  execute(node: AssignmentNode, visitor: ExecutorVisitor): any {
    const value = visitor.execute(node.right);
    try {
      visitor.scope.set(node.left.name, value);
    } catch {
      visitor.scope.apply({
        type: "default",
        name: node.left.name,
        value: value,
      });
    }
    return value;
  }
}

class BlockExecutor extends NjsStatementExecutor<BlockNode> {
  cast(node: NjsAstNode): node is BlockNode {
    return node instanceof BlockNode;
  }
  execute(node: BlockNode, visitor: ExecutorVisitor): any {
    visitor.scope.push();
    for (const stmt of node.statements) {
      const result = visitor.execute(stmt);
      if (result instanceof ControlFlowSignal) {
        visitor.scope.pop();
        return result;
      }
    }
    visitor.scope.pop();
  }
}

class IfExecutor extends NjsStatementExecutor<IfNode> {
  cast(node: NjsAstNode): node is IfNode {
    return node instanceof IfNode;
  }
  execute(node: IfNode, visitor: ExecutorVisitor): any {
    if (visitor.execute(node.condition)) {
      return visitor.execute(node.body);
    }
  }
}

class WhileExecutor extends NjsStatementExecutor<WhileNode> {
  cast(node: NjsAstNode): node is WhileNode {
    return node instanceof WhileNode;
  }
  execute(node: WhileNode, visitor: ExecutorVisitor): any {
    while (visitor.execute(node.condition)) {
      const result = visitor.execute(node.body);
      if (result instanceof ControlFlowSignal) {
        return result;
      }
    }
  }
}

class FunctionDeclarationExecutor extends NjsStatementExecutor<FunctionDeclarationNode> {
  cast(node: NjsAstNode): node is FunctionDeclarationNode {
    return node instanceof FunctionDeclarationNode;
  }
  execute(node: FunctionDeclarationNode, visitor: ExecutorVisitor): void {
    visitor.scope.apply({ type: "default", name: node.name, value: node });
  }
}

class FunctionCallExecutor extends NjsExpressionExecutor<FunctionCallNode, any> {
  cast(node: NjsAstNode): node is FunctionCallNode {
    return node instanceof FunctionCallNode;
  }
  execute(node: FunctionCallNode, visitor: ExecutorVisitor): any {
    const scopeVar = visitor.scope.get(node.name) as any;
    const funcNode = scopeVar.value || scopeVar;
    const argValues = node.args.map((arg) => visitor.execute(arg));
    visitor.scope.push();
    for (let i = 0; i < funcNode.params.length; i++) {
      visitor.scope.apply({ type: "default", name: funcNode.params[i], value: argValues[i] });
    }
    visitor.scope.apply({ type: "default", name: funcNode.name, value: funcNode });

    const execResult = visitor.execute(funcNode.body);
    let result = execResult instanceof ReturnSignal ? execResult.value : execResult;

    visitor.scope.pop();
    return result;
  }
}

class ReturnExecutor extends NjsStatementExecutor<ReturnNode> {
  cast(node: NjsAstNode): node is ReturnNode {
    return node instanceof ReturnNode;
  }
  execute(node: ReturnNode, visitor: ExecutorVisitor): any {
    const value = visitor.execute(node.argument);
    return new ReturnSignal(value);
  }
}

class ProgramExecutor extends NjsExpressionExecutor<ProgramNode, any> {
  cast(node: NjsAstNode): node is ProgramNode {
    return node instanceof ProgramNode;
  }
  execute(node: ProgramNode, visitor: ExecutorVisitor): any {
    let result = null;
    for (const stmt of node.body) {
      const stmtResult = visitor.execute(stmt);
      if (stmtResult instanceof ReturnSignal) {
        return stmtResult.value;
      }
      result = stmtResult !== null && stmtResult !== undefined ? stmtResult : result;
    }
    return result;
  }
}

// --- 4. Testing ---

describe("Njs Full Execution", () => {
  it("should calculate factorial using a while loop", async () => {
    const lexer = new Lexer(
      new StringHandler(),
      new IdentifierHandler(),
      new ServiceSymbolsHandler(),
      new NumberHandler(),
      new SpaceHandler(),
      //,
      // skip NewLine
    );

    // IMPORTANT: The real Parser does not reset its internal iterator inside parse() method
    // Because Njs engine creates one parser and calls parse(), wait no, Njs creates new Parser on start but its a singleton.
    // Wait, `njs.run` uses `this.parser.parse`. And `Parser.parse` DOES NOT RESET `this.iterator = 0`. So it fails on second run!
    // But each test creates a NEW njsEngine. Let's make sure.

    const executor = new Executor(
      new NumberExecutor(),
      new IdentifierExecutor(),
      new BinaryExpressionExecutor(),
      new AssignmentExecutor(),
      new BlockExecutor(),
      new IfExecutor(),
      new WhileExecutor(),
      new FunctionDeclarationExecutor(),
      new FunctionCallExecutor(),
      new ReturnExecutor(),
      new ProgramExecutor(),
    );

    // Reset parser iterator if needed

    const parser = new Parser(new ProgramTerminal());

    const logger = new Logger();
    vi.spyOn(logger, "handle").mockImplementation((err) => {
      console.error("NJS CAUGHT ERROR:", err);
    });

    // Patch parser to reset iterator (just in case)
    const originalParse = parser.parse.bind(parser);
    parser.parse = function (tokens: any[]) {
      (this as any).iterator = 0;
      (this as any).iteratorStack = [];
      const ast = originalParse(tokens);
      return ast;
    };

    const njsEngine = new Njs(logger, lexer, parser, executor, new ScopeManager());

    // debug AST
    const tokens = lexer.run(
      fs.readFileSync("src/__tests__/resources/factorial-loop.njs", "utf-8"),
    );
    const ast = parser.parse(tokens);

    const result = await njsEngine.run("src/__tests__/resources/factorial-loop.njs");
    expect(result).toBe(120);
  });

  it("should calculate factorial using recursion", async () => {
    const lexer = new Lexer(
      new StringHandler(),
      new IdentifierHandler(),
      new ServiceSymbolsHandler(),
      new NumberHandler(),
      new SpaceHandler(),
      //,
      // skip NewLine
    );

    // IMPORTANT: The real Parser does not reset its internal iterator inside parse() method
    // Because Njs engine creates one parser and calls parse(), wait no, Njs creates new Parser on start but its a singleton.
    // Wait, `njs.run` uses `this.parser.parse`. And `Parser.parse` DOES NOT RESET `this.iterator = 0`. So it fails on second run!
    // But each test creates a NEW njsEngine. Let's make sure.

    const executor = new Executor(
      new NumberExecutor(),
      new IdentifierExecutor(),
      new BinaryExpressionExecutor(),
      new AssignmentExecutor(),
      new BlockExecutor(),
      new IfExecutor(),
      new WhileExecutor(),
      new FunctionDeclarationExecutor(),
      new FunctionCallExecutor(),
      new ReturnExecutor(),
      new ProgramExecutor(),
    );

    // Reset parser iterator if needed

    const parser = new Parser(new ProgramTerminal());

    const logger = new Logger();
    vi.spyOn(logger, "handle").mockImplementation((err) => {
      console.error("NJS CAUGHT ERROR:", err);
    });

    // Patch parser to reset iterator (just in case)
    const originalParse = parser.parse.bind(parser);
    parser.parse = function (tokens: any[]) {
      (this as any).iterator = 0;
      (this as any).iteratorStack = [];
      const ast = originalParse(tokens);
      return ast;
    };

    const njsEngine = new Njs(logger, lexer, parser, executor, new ScopeManager());

    // debug AST
    const tokens = lexer.run(
      fs.readFileSync("src/__tests__/resources/factorial-loop.njs", "utf-8"),
    );
    const ast = parser.parse(tokens);

    const result = await njsEngine.run("src/__tests__/resources/factorial-recursive.njs");
    expect(result).toBe(120);
  });
});

it("should reuse the same njsEngine and run both scripts successfully without state leakage", async () => {
  const lexer = new Lexer(
    new StringHandler(),
    new IdentifierHandler(),
    new ServiceSymbolsHandler(),
    new NumberHandler(),
    new SpaceHandler(),
    new NewLineHandler(), // Now Lexer filters this automatically because we set skip=true
  );

  const parser = new Parser(new ProgramTerminal());

  const executor = new Executor(
    new NumberExecutor(),
    new IdentifierExecutor(),
    new BinaryExpressionExecutor(),
    new AssignmentExecutor(),
    new BlockExecutor(),
    new IfExecutor(),
    new WhileExecutor(),
    new FunctionDeclarationExecutor(),
    new FunctionCallExecutor(),
    new ReturnExecutor(),
    new ProgramExecutor(),
  );

  const njsEngine = new Njs(new Logger(), lexer, parser, executor, new ScopeManager());
  njsEngine.throwErrors = true;

  // Run first script
  const result1 = await njsEngine.run("src/__tests__/resources/factorial-loop.njs");
  expect(result1).toBe(120);

  // Run second script, the parser should reset and successfully parse
  const result2 = await njsEngine.run("src/__tests__/resources/factorial-recursive.njs");
  expect(result2).toBe(120);
});
