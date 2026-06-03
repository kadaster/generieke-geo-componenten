class Cloneable {
  clone<T extends this>(): T {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export default class Style extends Cloneable {}
