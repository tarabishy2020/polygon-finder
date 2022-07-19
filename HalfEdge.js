import { createVertex, createEdge, createFace } from "./TypeHelpers";
export const createHalfEdgeStore = ({ vertices, edges, json }) => {
  const sortEdgesAroundEachVertex = (angles) => {
    store.vertices.map((vertex) => {
      vertex.outBoundEdgesIdx.sort(
        (edgeIdx, anotheredgeIdx) =>
        angles[edgeIdx] -
        angles[anotheredgeIdx]
      );
      let prevIdx = vertex.outBoundEdgesIdx[vertex.outBoundEdgesIdx.length - 1];
      for (const edgeIdx of vertex.outBoundEdgesIdx) {
        store.edges[edgeIdx].nextIdx = prevIdx;
        prevIdx = edgeIdx;
      }
    });
  };

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
  const getFaceNeighborsFromFaceIdx = (faceIdx) => {
    const edges = iterateFaceFromEdgeIdx(store.faces[faceIdx].edgeIdx)
    const neighborFaces = []
    edges.map(edge=>{
      neighborFaces.push(store.edges[edge.twinIdx].faceIdx)
    })
    return neighborFaces
  };
  const store = {
    vertices: [],
    edges: [],
    faces: [],
  };
  // timeComplexity: ((Avg.Valence log Avg.Valence) * v) + e
  const initialize = (vertices, edges) => {
    // timeComplexity: v
    vertices.map((vertex, idx) => {
      store.vertices.push(createVertex(idx, vertex));
    });
    // timeComplexity: 2e
    const angles=[]
    for (let i = 0; i < edges.length; i++) {
      const insertionIdx = i * 2;
      const fromIdx = edges[i][0];
      const toIdx = edges[i][1];
      const fromVtx = store.vertices[fromIdx];
      const toVtx = store.vertices[toIdx];
      store.edges[insertionIdx] = createEdge(
        insertionIdx,
        fromIdx,
        toIdx
      );
      angles[insertionIdx] = calculateAngle(fromVtx, toVtx)
      fromVtx.outBoundEdgesIdx.push(insertionIdx);
      store.edges[insertionIdx + 1] = createEdge(
        insertionIdx + 1,
        toIdx,
        fromIdx
      );
      angles[insertionIdx + 1] = calculateAngle(toVtx, fromVtx)
      toVtx.outBoundEdgesIdx.push(insertionIdx + 1);
      store.edges[insertionIdx].twinIdx = insertionIdx + 1;
      store.edges[insertionIdx + 1].twinIdx = insertionIdx;
    }

    // timeComplexity: (Avg.Valence log Avg.Valence) * v 
    sortEdgesAroundEachVertex(angles);

    const visited = [];
    // timeComplexity: 2e
    let fInsertionIdx = 0;
    for (const edge of store.edges) {
      if (visited[edge.index]) continue;
      const faceEdgesIdx = [];
      let current = edge;
      do {
        current.faceIdx = fInsertionIdx;
        visited[current.index] = true;
        let twin = store.edges[current.twinIdx];
        current = store.edges[twin.nextIdx];
      } while (current !== edge);
      store.faces.push(createFace(fInsertionIdx, edge.index))
      fInsertionIdx++;
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
  const dumpToJson = () => JSON.stringify(store);

  if (vertices?.length > 0 && edges?.length > 0) {
    initialize(vertices, edges);
  } else if (json) {
    initializeJson(json);
  }
  return [store, {getFaceNeighborsFromFaceIdx, dumpToJson, iterateFaceFromEdgeIdx }];
};
