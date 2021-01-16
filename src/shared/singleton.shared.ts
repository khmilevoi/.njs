const instances = new Map<Function, Map<any, object>>();

export class Singleton {
  constructor() {
    const current = instances.get(this.constructor);

    if (current == null) {
      instances.set(this.constructor, new Map());

      return this;
    } else {
      return current;
    }
  }
}
