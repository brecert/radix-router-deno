import { Node, RadixTrie } from "./radix_tree.ts";

export class DataNode<T> extends Node {
  static bind<T>(data: T) {
    return () => new this(data);
  }
  constructor(public data: T) {
    super();
  }
}

export class Router<T> extends RadixTrie {
  constructor(routes: Record<string, T>) {
    super();

    for (const name in routes) {
      this.insert(name, DataNode.bind(routes[name]));
    }
  }

  getData(path: string) {
    const lookup = this.lookup(path);
    if (lookup.success) {
      return (lookup.closestNode as DataNode<T>).data;
    }
  }
}
