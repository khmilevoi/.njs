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
  grammar = [/\S+/];

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [value] = items as [NjsToken<any>];

    return new Value(value);
  }
}

class VariableTerminal extends NjsBaseTerminal {
  grammar = [/\w+/, ":", new OrHelper("number", "string")];

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
  grammar = [new VariableTerminal(), "=", new ValueTerminal(), ";"];

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [variable, , value] = items as [Variable, string, Value];

    return new Assign(variable, value);
  }
}
class ExpressionTerminal extends NjsBaseTerminal {
  grammar = [new OrHelper(new AssignTerminal(), new ValueTerminal())];

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [extension] = items;

    return extension;
  }
}

class InstructionTerminal extends NjsBaseTerminal {
  gramar = [new OrHelper(new AssignTerminal(), new ConditionTerminal())];

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
  grammar: NjsGrammarItem[] = [
    "if",
    "(",
    new ExpressionTerminal(),
    ")",
    "{",
    new InstructionTerminal(),
    "}",
  ];

  protected parse(items: NjsParserHandledItem[]): Condition {
    const [, , expression, , instruction] = items;

    return new Condition(expression, instruction);
  }
}

describe("Parser", () => {
  let source: string = "";

  beforeAll(async () => {});

  it("should", async function () {
    const tokens = njs.tokenize("foo: number = 100");

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    console.log(result);
  });

  it("should 1", async function () {
    const tokens = njs.tokenize("foo: string = 100");

    const parser = new Parser(new AssignTerminal());

    const result = parser.parse(tokens);

    console.log(result);
  });

  it("should 2", async function () {
    const tokens = njs.tokenize(`
    foo: string = "str value";
    foo1: string = "str value 2";
    `);

    const parser = new Parser(new LoopHelper(new AssignTerminal()));

    const result = parser.parse(tokens);

    console.log(result);
  });

  it("should 3", async function () {
    const tokens = njs.tokenize(`
    if(true) {
      foo: string = "str value";
      foo1: string = "str value 2";
    }
    `);

    const parser = new Parser(new LoopHelper(new ConditionTerminal()));

    const result = parser.parse(tokens);

    console.log(result);
  });
});
