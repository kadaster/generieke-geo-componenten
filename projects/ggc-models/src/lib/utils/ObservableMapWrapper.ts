import { Observable } from "rxjs";

interface ObservableMap<O> {
  subject: SubjectLike<O>;
  observable: Observable<O>;
}

interface SubjectLike<O> extends Observable<O> {
  asObservable(): Observable<O>;

  next(val: O): void;
}

export class ObservableMapWrapper<K, O> {
  private readonly create: () => SubjectLike<O>;
  private readonly map: Map<K, ObservableMap<O>>;

  constructor(create: () => SubjectLike<O>) {
    this.map = new Map<K, ObservableMap<O>>();
    this.create = create;
  }

  get size(): number {
    return this.map.size;
  }

  getOrCreate(name: K): ObservableMap<O> {
    if (!this.map.has(name)) {
      const subject = this.create();
      this.map.set(name, { subject, observable: subject.asObservable() });
    }
    return this.map.get(name) as ObservableMap<O>;
  }

  getOrCreateSubject(name: K): SubjectLike<O> {
    const map = this.getOrCreate(name);
    return map.subject;
  }

  getOrCreateObservable(name: K): Observable<O> {
    const map = this.getOrCreate(name);
    return map.observable;
  }

  get(name: K): ObservableMap<O> | undefined {
    return this.map.get(name);
  }

  has(name: K): boolean {
    return this.map.has(name);
  }

  delete(name: K): boolean {
    return this.map.delete(name);
  }
}
