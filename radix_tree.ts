export interface Edge {
  label: string;
  targetNode: Node;
}

export class Node {
  edges: Edge[];
  #isLeaf;

  constructor(edges: Edge[] = [], isLeaf = true) {
    this.edges = edges;
    this.#isLeaf = isLeaf;
  }

  isLeaf(): boolean {
    return this.#isLeaf || this.edges.length === 0;
  }
}

export interface LookupResult {
  closestNode: Node;
  success: boolean;
  elementsFound: number;
}

/** Replaces an item inside of an arrray with an item if it exists */
function replace<T>(arr: T[], item: T, ...items: T[]) {
  const index = arr.indexOf(item);
  if (index >= 0) {
    arr.splice(index, 1, ...items);
    return true;
  } else {
    return false;
  }
}

export class RadixTree {
  rootNode = new Node([], false);

  lookup(x: string): LookupResult {
    let traverseNode = this.rootNode;
    let elementsFound = 0;
    while (
      traverseNode != null && elementsFound < x.length
    ) {
      const nextEdge = traverseNode.edges.find((edge) =>
        x.startsWith(edge.label, elementsFound)
      );
      if (nextEdge != null) {
        traverseNode = nextEdge.targetNode;
        elementsFound += nextEdge.label.length;
      } else {
        break;
      }
    }

    return {
      closestNode: traverseNode,
      success: traverseNode.isLeaf() && elementsFound === x.length,
      elementsFound: elementsFound,
    };
  }

  insert(x: string, fn: () => Node = () => new Node()) {
    const lookup = this.lookup(x);
    // there is nothing more to be done since the exact value is already in
    // perhaps in the future I'll have it replace the current value
    if (lookup.success) return;

    const label = x.slice(lookup.elementsFound);

    // try to find an edge that matches the label
    let edgeFilter = lookup.closestNode.edges;
    for (let i = 0; i < 1 || i < label.length && edgeFilter.length > 1; i++) {
      edgeFilter = edgeFilter.filter((edge) =>
        edge.label.charCodeAt(i) === label.charCodeAt(i)
      );
    }

    const sharedEdge = edgeFilter[0];

    if (sharedEdge != null) {
      let sharedCount = 0;
      while (
        sharedCount < label.length &&
        label.charCodeAt(sharedCount) ===
          sharedEdge.label.charCodeAt(sharedCount)
      ) {
        sharedCount += 1;
      }

      if (label.length === sharedCount) {
        const targetNode = fn();

        targetNode.edges.push({
          label: sharedEdge.label.slice(sharedCount),
          targetNode: sharedEdge.targetNode,
        });

        replace(lookup.closestNode.edges, sharedEdge, {
          label: label.slice(0, sharedCount),
          targetNode: targetNode,
        });

        return;
      }

      replace(lookup.closestNode.edges, sharedEdge, {
        label: label.slice(0, sharedCount),
        targetNode: new Node([
          { label: label.slice(sharedCount), targetNode: fn() },
          {
            label: sharedEdge.label.slice(sharedCount),
            targetNode: sharedEdge.targetNode,
          },
        ], false),
      });
    }

    lookup.closestNode.edges.push({
      label: label,
      targetNode: fn(),
    });
  }
}
