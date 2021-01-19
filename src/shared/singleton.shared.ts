const instances = new Map<Function, object>();

export class Singleton {
  constructor() {
    const current = instances.get(this.constructor);

    if (current == null) {
      instances.set(this.constructor, this);

      return this;
    } else {
      return current;
    }
  }
}
