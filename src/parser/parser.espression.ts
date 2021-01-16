import { ExpressionHandler } from "parser/types";
import { Singleton } from "shared/singleton.shared";

export class Expression extends Singleton {
  private readonly expressions: ExpressionHandler[] = [];

  constructor(...expressions: ExpressionHandler[]) {
    super();

    this.expressions.push(...expressions);
  }
}
