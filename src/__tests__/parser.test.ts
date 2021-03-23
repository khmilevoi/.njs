import { njs } from "index";
import { NjsToken } from "lexer/types";
import { Parser } from "parser";
import {
  NjsAstNode,
  NjsBaseTerminal,
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
  grammar = [/\w+/, ":", /\w+/];

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
  grammar = [new VariableTerminal(), "=", new ValueTerminal()];

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    const [variable, , value] = items as [Variable, string, Value];

    return new Assign(variable, value);
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
});
