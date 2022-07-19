import {createVertex, createEdge} from './TypeHelpers'
import {calculateAngle, sortEdgesAroundEachVertex} from './Utilities'
export const createHalfEdgeStore = ({ vertices, edges }) => {
  const store = {
    vertices: [],
    edges: [],
    faces: [],
  };
  // const findFaceNeighbors=(HalfEdgeStore, faceIdx)=>{
  //   HalfEdgeStore.faces[faceIdx]
  // }
  const initialize = (vertices, edges) => {
    vertices.map((vertex, idx) => {
      store.vertices.push(createVertex(idx, vertex));
    });
    for (let i = 0; i < edges.length; i++) {
      const insertionIdx = i * 2;
      const from = store.vertices[edges[i][0]];
      const to = store.vertices[edges[i][1]];
      store.edges[insertionIdx] = createEdge(insertionIdx,from, to, calculateAngle(from, to));
      from.outBoundEdgesIdx.push(insertionIdx)
      store.edges[insertionIdx + 1] = createEdge(insertionIdx + 1,to, from, calculateAngle(to, from));
      to.outBoundEdgesIdx.push(insertionIdx + 1)
      store.edges[insertionIdx].twinIdx = insertionIdx + 1;
      store.edges[insertionIdx + 1].twinIdx = insertionIdx;
    }
    sortEdgesAroundEachVertex(store);
    // const tempEdges = [...store.edges]
    for (const edge of store.edges) {
      if (edge.visited) continue;
      const face = [];
      store.faces.push(face);
      let current = edge;
      do {
        face.push(current.index);
        current.visited = true;
        let twin = store.edges[current.twinIdx]
        current = store.edges[twin.nextIdx];
      } while (current !== edge);
    }
  };
  if (vertices?.length > 0 && edges?.length > 0) {
    initialize(vertices, edges);
  }
  return store;
};


