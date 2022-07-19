import {createVertex, createEdge} from './TypeHelpers'
import {calculateAngle, sortEdges} from './Utilities'
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
      store.edges[insertionIdx] = createEdge(from, to, calculateAngle(from, to));
      from.outBoundEdges.push(store.edges[insertionIdx])
      store.edges[insertionIdx + 1] = createEdge(to, from, calculateAngle(to, from));
      to.outBoundEdges.push(store.edges[insertionIdx + 1])
      store.edges[insertionIdx].twin = store.edges[insertionIdx + 1];
      store.edges[insertionIdx + 1].twin = store.edges[insertionIdx];
    }
    for (const vertex of store.vertices) {
      sortEdges(vertex);
    }
    // const tempEdges = [...store.edges]
    for (const edge of store.edges) {
      if (edge.visited) continue;
      const face = [];
      store.faces.push(face);
      let current = edge;
      do {
        face.push(store.edges.indexOf(current));
        current.visited = true;
        current = current.twin.next;
      } while (current !== edge);
    }
  };
  if (vertices?.length > 0 && edges?.length > 0) {
    initialize(vertices, edges);
  }
  return store;
};


