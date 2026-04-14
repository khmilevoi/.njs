import { njs } from "index";
import { NjsToken } from "lexer/types";
import { Parser } from "parser";
import { OrHelper, LoopHelper } from "parser/helpers/or.helper";
import {
  NjsAstNode,
  NjsBaseTerminal,
  NjsGrammarItem,
  NjsParserHandledItem,
} from "parser/types";

class Variable implements NjsAstNode {
  constructor(readonly name: string, readonly type: string) {}
}

class Value implements NjsAstNode {
  constructor(readonly value: any) {}
}

class Assign implements NjsAstNode {
  constructor(readonly variable: Variable, readonly value: Value) {}
}

class ValueTerminal extends NjsBaseTerminal {
  get grammar() {
    return [/\S+/];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [value] = items as [NjsToken<any>];

    return new Value(value);
  }
}

class VariableTerminal extends NjsBaseTerminal {
  get grammar() {
    return [/\w+/, ":", new OrHelper("number", "string")];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [name, , type] = items as [
      NjsToken<string>,
      string,
      NjsToken<string>
    ];

    return new Variable(name.inner, type.inner);
  }
}

class AssignTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new VariableTerminal(), "=", new ValueTerminal(), ";"];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [variable, , value] = items as [Variable, string, Value];

    return new Assign(variable, value);
  }
}

class ExpressionTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new OrHelper(new AssignTerminal(), new ValueTerminal())];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [extension] = items;

    return extension;
  }
}

class InstructionTerminal extends NjsBaseTerminal {
  get grammar() {
    return [new OrHelper(new AssignTerminal(), new ConditionTerminal())];
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [instruction] = items;

    return instruction;
  }
}

class Condition implements NjsAstNode {
  constructor(
    readonly condition: NjsAstNode,
    readonly instruction: NjsAstNode
  ) {}
}

class ConditionTerminal extends NjsBaseTerminal {
  get grammar(): NjsGrammarItem[] {
    return [
      "if",
      "(",
      new ExpressionTerminal(),
      ")",
      "{",
      new InstructionTerminal(),
      "}",
    ];
  }

  protected parse(items: NjsParserHandledItem[]): Condition {
    const [, , expression, , , instruction] = items;

    return new Condition(expression, instruction);
  }
}

describe("Parser", () => {
  let source: string = "";

  beforeAll(async () => {});

  it("should parse number variable assignment correctly", async function () {
    const tokens = njs.tokenize("foo: number = 100;");

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    expect(result.root).toBeInstanceOf(Assign);
    const assign = result.root as Assign;
    expect(assign.variable.name).toBe("foo");
    expect(assign.variable.type).toBe("number");
    expect(assign.value.value.inner).toBe(100);
  });

  it("should parse string variable assignment correctly", async function () {
    const tokens = njs.tokenize("foo: string = \"str value\";");

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    expect(result.root).toBeInstanceOf(Assign);
    const assign = result.root as Assign;
    expect(assign.variable.name).toBe("foo");
    expect(assign.variable.type).toBe("string");
    expect(assign.value.value.inner).toBe("str value");
  });

  it("should parse multiple variable assignments using LoopHelper", async function () {
    const tokens = njs.tokenize(`
    foo: string = "str value";
    foo1: string = "str value 2";
    `);

    const parser = new Parser(new LoopHelper(new AssignTerminal()));

    const result = parser.parse(tokens);

    expect(result.root).toBeDefined();
    const root = result.root as any;
    expect(root.nodes).toBeDefined();
    expect(root.nodes).toHaveLength(2);

    const firstAssign = root.nodes[0] as Assign;
    expect(firstAssign).toBeInstanceOf(Assign);
    expect(firstAssign.variable.name).toBe("foo");
    expect(firstAssign.variable.type).toBe("string");
    expect(firstAssign.value.value.inner).toBe("str value");

    const secondAssign = root.nodes[1] as Assign;
    expect(secondAssign).toBeInstanceOf(Assign);
    expect(secondAssign.variable.name).toBe("foo1");
    expect(secondAssign.variable.type).toBe("string");
    expect(secondAssign.value.value.inner).toBe("str value 2");
  });

  it("should parse conditions with nested instructions", async function () {
    const tokens = njs.tokenize(`
    if(true) {
      foo: string = "str value";
    }
    `);

    const parser = new Parser(new LoopHelper(new ConditionTerminal()));

    const result = parser.parse(tokens);

    expect(result.root).toBeDefined();
    const root = result.root as any;
    expect(root.nodes).toBeDefined();
    expect(root.nodes).toHaveLength(1);

    const condition = root.nodes[0] as Condition;
    expect(condition).toBeInstanceOf(Condition);

    const expr = condition.condition as Value;
    expect(expr).toBeInstanceOf(Value);
    expect(expr.value.inner).toBe("true");

    expect(condition.instruction).toBeInstanceOf(Assign);
    const instruction = condition.instruction as Assign;
    expect(instruction.variable.name).toBe("foo");
    expect(instruction.variable.type).toBe("string");
    expect(instruction.value.value.inner).toBe("str value");
  });

  it("should rollback when semicolon is missing", async function () {
    const tokens = njs.tokenize("foo: number = 100"); // Missing semicolon

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    // Because it fails to find semicolon, handle should return null
    // and Parser falls back to creating an empty Node.
    expect(result.root).toBeDefined();
    expect(result.root).not.toBeInstanceOf(Assign);
    expect(Object.keys(result.root).length).toBe(0);
  });

  it("should rollback when condition brackets are unclosed", async function () {
    const tokens = njs.tokenize(`
    if(true) {
      foo: string = "str value";
    // missing closing brace }
    `);

    const parser = new Parser(new ConditionTerminal());

    const result = parser.parse(tokens);

    expect(result.root).toBeDefined();
    expect(result.root).not.toBeInstanceOf(Condition);
    expect(Object.keys(result.root).length).toBe(0);
  });

  it("should rollback when type is not matched in OrHelper", async function () {
    // Variable type `boolean` is not matched by `OrHelper("number", "string")`
    const tokens = njs.tokenize("foo: boolean = true;");

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    expect(result.root).toBeDefined();
    expect(result.root).not.toBeInstanceOf(Assign);
    expect(Object.keys(result.root).length).toBe(0);
  });
});
