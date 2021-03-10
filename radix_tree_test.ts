import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.89.0/testing/asserts.ts";
import { Edge, Node, RadixTree } from "./radix_tree.ts";

class DataNode<T> extends Node {
  static bind<T>(data: T) {
    return () => new this(data);
  }

  constructor(public data: T, edges: Edge[] = [], isLeaf = true) {
    super(edges, isLeaf);
  }
}

Deno.test("distinct insertions", () => {
  const trie = new RadixTree();
  trie.insert("test", DataNode.bind("test"));
  trie.insert("slow", DataNode.bind("slow"));
  trie.insert("water", DataNode.bind("water"));

  assertEquals<Node>(
    trie.rootNode,
    new Node([
      { label: "test", targetNode: new DataNode("test") },
      { label: "slow", targetNode: new DataNode("slow") },
      { label: "water", targetNode: new DataNode("water") },
    ], false),
  );

  assertEquals(trie.lookup("test"), {
    closestNode: new DataNode("test"),
    success: true,
    elementsFound: 4,
  });
});

Deno.test("suffix insertion split", () => {
  const trie = new RadixTree();
  trie.insert("test", DataNode.bind("test"));
  trie.insert("slow", DataNode.bind("slow"));
  trie.insert("water", DataNode.bind("water"));
  trie.insert("slower", DataNode.bind("slower"));

  assertEquals<Node>(
    trie.rootNode,
    new Node([
      { label: "test", targetNode: new DataNode("test") },
      {
        label: "slow",
        targetNode: new DataNode("slow", [{
          label: "er",
          targetNode: new DataNode("slower"),
        }]),
      },
      { label: "water", targetNode: new DataNode("water") },
    ], false),
  );

  assertEquals(trie.lookup("slow"), {
    closestNode: trie.rootNode.edges[1].targetNode,
    success: true,
    elementsFound: 4,
  });
});

Deno.test("prefix insertion split", () => {
  const trie = new RadixTree();
  trie.insert("slower", DataNode.bind("slower"));
  trie.insert("water", DataNode.bind("water"));
  trie.insert("test", DataNode.bind("test"));
  trie.insert("slow", DataNode.bind("slow"));
  
  assertEquals<Node>(
    trie.rootNode,
    new Node([
      {
        label: "slow",
        targetNode: new DataNode("slow", [{
          label: "er",
          targetNode: new DataNode("slower"),
        }]),
      },
      { label: "water", targetNode: new DataNode("water") },
      { label: "test", targetNode: new DataNode("test") },
    ], false),
  );

  assertEquals(trie.lookup("slow"), {
    closestNode: trie.rootNode.edges[0].targetNode,
    success: true,
    elementsFound: 4,
  });

  assertEquals(trie.lookup("slowe"), {
    closestNode: trie.rootNode.edges[0].targetNode,
    success: false,
    elementsFound: 4,
  });

  assertEquals(trie.lookup("slower"), {
    closestNode: trie.rootNode.edges[0].targetNode.edges[0].targetNode,
    success: true,
    elementsFound: 6,
  });

  assertEquals(trie.lookup("slowere"), {
    closestNode: trie.rootNode.edges[0].targetNode.edges[0].targetNode,
    success: false,
    elementsFound: 6,
  });
});
