import fs from "fs";

let content = fs.readFileSync("src/__tests__/njs.test.ts", "utf-8");

content = content.replace(
  /class ExpressionTerminal extends NjsBaseTerminal \{[\s\S]*?\n\}/,
  `class ExpressionTerminal extends NjsBaseTerminal {
  get grammar(): NjsGrammarItem[] {
    return [
      new OrHelper(
        new LazyTerminal(() => new AssignmentTerminal()),
        new LazyTerminal(() => new BinaryExpressionTerminal()),
        new PrimaryTerminal()
      )
    ];
  }
  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return items[0] as NjsAstNode;
  }
}`,
);

content = content.replace(
  /class StatementTerminal extends NjsBaseTerminal \{[\s\S]*?\n\}/,
  `class StatementTerminal extends NjsBaseTerminal {
  get grammar(): NjsGrammarItem[] {
    return [
      new OrHelper(
        new LazyTerminal(() => new AssignmentTerminal()),
        new IfTerminal(),
        new WhileTerminal(),
        new FunctionDeclarationTerminal(),
        new ReturnTerminal(),
        new LazyTerminal(() => new BareExpressionTerminal())
      )
    ];
  }
  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return items[0] as NjsAstNode;
  }
}`,
);

fs.writeFileSync("src/__tests__/njs.test.ts", content);
