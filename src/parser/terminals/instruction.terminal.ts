import { ParserVisitor } from "parser/parser.visitor";
import { InstructionHandler, NjsAstTree, NjsTerminal } from "parser/types";
import { Singleton } from "shared/singleton.shared";

export class Instruction extends Singleton implements NjsTerminal {
  private readonly instructions: InstructionHandler[] = [];

  constructor(...instructions: InstructionHandler[]) {
    super();

    this.instructions.push(...instructions);
  }

  handle(visitor: ParserVisitor): NjsAstTree | null {
    for (const instruction of this.instructions) {
      const result = instruction.handle(visitor);

      if (visitor) {
        return result;
      }
    }

    return null;
  }
}
