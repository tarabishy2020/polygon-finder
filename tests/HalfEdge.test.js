import { assert, expect, test, describe } from "vitest";
import { example1 } from "../exampleData";
import { parseVEJson } from "../InputData";
import { createHalfEdgeStore } from "../HalfEdge-optimize";

const example = example1;
describe("Half Edge Store", () => {
  const result = createHalfEdgeStore(example);
  test("result is defined", () => expect(result).toBeDefined());

  const [store, api] = result;
  test("store is defined", () => expect(store).toBeDefined());
  test("api is defined", () => expect(api).toBeDefined());
  // following assumption that no floating lines or holes exist
  // data forms closed cycles within an interconnected component
  test("Vertices length match input length", () =>
    expect(store.vertices.length).toEqual(example.vertices.length));
  test("Edges length is double input length", () =>
    expect(store.edges.length).toEqual(example.edges.length * 2));
  test("Faces length is not 0", () =>
    expect(store.faces.length).not.toBeLessThanOrEqual(0));
  // single exterior boundary
  test("One external border exists", () =>{
      const numOfBorderCycles = store.faces.filter((x) => x.border).length;
      expect(numOfBorderCycles).toEqual(1);
    })

  // api
  const {
    getFaceNeighborsFromFaceIdx,
    dumpToJson,
    walkFromFaceIdx,
    iterateFaceFromEdgeIdx,
  } = api;
  test("Deserializing from previously serialized data results in the same store", () => {
    const serialized = dumpToJson();
    const [deserialized, _] = createHalfEdgeStore({ json: serialized });
    expect(store).toEqual(deserialized);
  });

  test('able to traverse all edges from faces',()=>{
    const visitedEdges = new Array(store.edges.length).fill(false);
      for (const face of store.faces) {
        if(face.border) continue;
          const current = store.edges[face.edgeIdx];
          const edges = iterateFaceFromEdgeIdx(face.edgeIdx);
          expect(edges.length).not.lessThanOrEqual(0);
          edges.map(edge=>visitedEdges[edge.index]=true)
        }
        const borderFace = store.faces.filter((x) => x.border)[0]
        const borderEdges =  iterateFaceFromEdgeIdx(borderFace.edgeIdx,(x)=>x.index)
        const leftOut = visitedEdges.flatMap((val,idx)=>val?[]:idx)
        expect(borderEdges.length).toEqual(leftOut.length)
        expect(borderEdges).toEqual(expect.arrayContaining(leftOut))
    })
    test('get to all faces but border from one',()=>{
        const borderIdx = store.faces.filter((x) => x.border)[0].index
        const startIdx =  borderIdx !== 0 ? 0 : 1
        const levels = walkFromFaceIdx(startIdx).flat(Infinity)
        const levelsSet = new Set([...levels])
        const left = [...Array(store.faces.length).keys()].filter(x=> !levelsSet.has(x))
        expect(left.length).toEqual(1)
        expect(left[0]).toEqual(borderIdx)
    })
});
