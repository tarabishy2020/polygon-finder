import { assert, expect, test, describe } from "vitest";
import { CreateInputDataStore, parseVEJson } from "../InputData";

describe("InputDataStore", () => {
  const store = CreateInputDataStore();
  test("return is not undefined", () => expect(store).not.toBeUndefined());
  test("returned object matches schema", () =>
    expect(store).toMatchObject({
      vertices: [],
      edges: [],
      addVertex: expect.any(Function),
      addVertices: expect.any(Function),
      addEdge: expect.any(Function),
      addEdges: expect.any(Function),
      clear: expect.any(Function),
    }));
  // add a single vertex
  const vertex = [2, 2];

  test("adding a vertex", () => {
    store.addVertex(vertex);
    expect(store.vertices).toEqual(expect.arrayContaining([vertex]));
  });
  // add multiple vertices
  const vertices = [
    [3, 3],
    [4, 4],
    [5, 5],
  ];
  test("adding multiple vertices", () => {
    store.addVertices(vertices);
    expect(store.vertices).toEqual(
      expect.arrayContaining([...vertices, vertex])
    );
  });
  // add a single edge
  const edge = [2, 2];
  test("add an edge", () => {
    store.addEdge(edge);
    expect(store.edges).toEqual(expect.arrayContaining([edge]));
  });
  // add multiple vertices
  const edges = [
    [3, 3],
    [4, 4],
    [5, 5],
  ];
  test('add edges',()=>{
    store.addEdges(edges);
    expect(store.edges).toEqual(expect.arrayContaining([...edges, edge]));
  })
  test('clearing data',()=>{
    store.clear();
    expect(store.edges.length).toBe(0);
    expect(store.vertices.length).toBe(0);
  })
});
describe('parseVEJson',()=>{
  describe('works with correct input',()=>{
    const input = {
      vertices: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    };
    const inputString = JSON.stringify(input);
    const store = parseVEJson(inputString);
    test('deserialized vertices',()=>expect(store.vertices).toEqual(input.vertices))
    test('deserialized edges',()=>expect(store.edges).toEqual(input.edges))
  })
  describe('fails on incorrect input',()=>{
    const input = {
      points: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    };
    const inputString = JSON.stringify(input);
    const store = parseVEJson(inputString);
    test('returns undefined',()=>expect(store).toBeUndefined())
  })
})

