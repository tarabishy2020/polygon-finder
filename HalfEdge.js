import { createVertex, createEdge, createFace } from "./TypeHelpers";
export const createHalfEdgeStore = ({ vertices, edges }) => {
  const sortEdgesAroundEachVertex = (halfEdgeStore) => {
    halfEdgeStore.vertices.map((vertex) => {
      vertex.outBoundEdgesIdx.sort(
        (edgeIdx, anotheredgeIdx) =>
          halfEdgeStore.edges[edgeIdx].angle -
          halfEdgeStore.edges[anotheredgeIdx].angle
      );
      let prevIdx = vertex.outBoundEdgesIdx[vertex.outBoundEdgesIdx.length - 1];
      for (const edgeIdx of vertex.outBoundEdgesIdx) {
        halfEdgeStore.edges[edgeIdx].nextIdx = prevIdx;
        prevIdx = edgeIdx;
      }
    });
  };
  const getFaceName = (faceEdgesIdx) =>
    faceEdgesIdx.sort((a, b) => a - b).join(",");
  const calculateAngle = (from, to) =>
    Math.atan2(to.point[1] - from.point[1], to.point[0] - from.point[0]);
  const iterateFaceFromEdgeIdx=(edgeIdx, propertySelector=(x)=>x)=>{
    const tempStore = [];
    const edge = store.edges[edgeIdx];
    let current = edge;
    do {
      tempStore.push(propertySelector(current));
      let twin = store.edges[current.twinIdx];
      current = store.edges[twin.nextIdx];
    } while (current !== edge);
    return tempStore;
  }
  const getFaceNeighborsFromFaceName = (faceName) => {
    const face = store.faces[faceName]
    const edges = iterateFaceFromEdgeIdx(face.edgeIdx)
    const neighborFaces = []
    edges.map(edge=>{
      const neighborFaceEdges = iterateFaceFromEdgeIdx(edge.twinIdx)
      neighborFaces.push(getFaceName(neighborFaceEdges.map(x=>x.index)))
    })
    return neighborFaces
  };
  const store = {
    vertices: [],
    edges: [],
    faces: {},
  };
  const initialize = (vertices, edges) => {
    vertices.map((vertex, idx) => {
      store.vertices.push(createVertex(idx, vertex));
    });
    for (let i = 0; i < edges.length; i++) {
      const insertionIdx = i * 2;
      const fromIdx = edges[i][0];
      const toIdx = edges[i][1];
      const fromVtx = store.vertices[fromIdx];
      const toVtx = store.vertices[toIdx];
      store.edges[insertionIdx] = createEdge(
        insertionIdx,
        fromIdx,
        toIdx,
        calculateAngle(fromVtx, toVtx)
      );
      fromVtx.outBoundEdgesIdx.push(insertionIdx);
      store.edges[insertionIdx + 1] = createEdge(
        insertionIdx + 1,
        toIdx,
        fromIdx,
        calculateAngle(toVtx, fromVtx)
      );
      toVtx.outBoundEdgesIdx.push(insertionIdx + 1);
      store.edges[insertionIdx].twinIdx = insertionIdx + 1;
      store.edges[insertionIdx + 1].twinIdx = insertionIdx;
    }

    sortEdgesAroundEachVertex(store);

    const visited = [];
    for (const edge of store.edges) {
      if (visited[edge.index]) continue;
      const faceEdgesIdx = [];
      let current = edge;
      do {
        faceEdgesIdx.push(current.index);
        visited[current.index] = true;
        let twin = store.edges[current.twinIdx];
        current = store.edges[twin.nextIdx];
      } while (current !== edge);
      Object.assign(
        store.faces,
        createFace(getFaceName(faceEdgesIdx), edge.index)
      );
    }
  };
  const initializeJson = (json) => {
    const parsed = JSON.parse(json);
    if (!(parsed["vertices"] || parsed["edges"] || parsed["faces"])) {
      console.log("Need all keys:['vertices', 'edges', 'faces']");
    }
    store.vertices = parsed.vertices;
    store.edges = parsed.edges;
    store.faces = parsed.faces;
  };
  const dumpToJson = () => {
    JSON.stringify(store);
  };
  if (vertices?.length > 0 && edges?.length > 0) {
    initialize(vertices, edges);
  } else if (json) {
    initializeJson(json);
  }
  return [store, { getFaceName, getFaceNeighborsFromFaceName, dumpToJson, iterateFaceFromEdgeIdx }];
};
