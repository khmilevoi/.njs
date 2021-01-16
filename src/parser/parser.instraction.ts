import { InstructionHandler } from "parser/types";
import { Singleton } from "shared/singleton.shared";

export class Instruction extends Singleton {
  private readonly instructions: InstructionHandler[] = [];

  constructor(...instructions: InstructionHandler[]) {
    super();

    this.instructions.push(...instructions);
  }
}
