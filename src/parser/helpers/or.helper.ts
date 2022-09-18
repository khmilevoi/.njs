import { ParserVisitor } from "parser/parser.visitor";
import {
  NjsAstNode,
  NjsBaseTerminal,
  NjsGrammarItem,
  NjsParserHandledItem,
} from "parser/types";

export class OrHelper extends NjsBaseTerminal {
  private readonly handlers: NjsGrammarItem[];

  constructor(...handlers: NjsGrammarItem[]) {
    super();

    this.handlers = handlers;
  }

  handle(visitor: ParserVisitor): NjsAstNode | null {
    for (let handler of this.handlers) {
      const result = this.evaluateHandler(handler, visitor);

      if (result) {
        return result;
      }
    }

    return null;
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return {} as any;
  }
}

export class LoopNode implements NjsAstNode {
  constructor(readonly nodes: NjsAstNode[]) {}
}

export class LoopHelper extends NjsBaseTerminal {
  private readonly handlers: NjsGrammarItem[];

  private nodes: NjsAstNode[] = [];

  constructor(...handlers: NjsGrammarItem[]) {
    super();

    this.handlers = handlers;
  }

  handle(visitor: ParserVisitor): LoopNode {
    return this.loop(visitor);
  }

  private loop(visitor: ParserVisitor): LoopNode {
    const current = visitor.peep();

    if (current == null) {
      return new LoopNode(this.nodes);
    }

    const result = this.evaluateHandler(
      new OrHelper(...this.handlers),
      visitor
    );

    if (result == null) {
      return new LoopNode(this.nodes);
    }

    this.nodes.push(result);

    return this.loop(visitor);
  }

  protected parse(items: NjsParserHandledItem[]): NjsAstNode {
    return {} as any;
  }
}
