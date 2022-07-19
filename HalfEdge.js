export const createHalfEdgeStore = ({ vertices, edges }) => {
  const store = {
    vertices: [],
    edges: [],
    faces: [],
  };
  const initialize = (vertices, edges) => {
    vertices.map((vertex, idx) => {
      store.vertices.push(createVertex(idx, vertex));
    });
    for (let i = 0; i < edges.length; i++) {
      const insertionIdx = i * 2;
      const from = store.vertices[edges[i][0]];
      const to = store.vertices[edges[i][1]];
      store.edges[insertionIdx] = createEdge(from, to);
      store.edges[insertionIdx + 1] = createEdge(to, from);

      store.edges[insertionIdx].setTwin(store.edges[insertionIdx + 1]);
      store.edges[insertionIdx + 1].setTwin(store.edges[insertionIdx]);
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

const sortEdges = (vertex) => {
  vertex.outBoundEdges.sort(
    (edge, anotheredge) => edge.angle - anotheredge.angle
  );
  let prev = vertex.outBoundEdges[vertex.outBoundEdges.length - 1];
  for (const edge of vertex.outBoundEdges) {
    edge.setNext(prev);
    prev = edge;
  }
};
const calculateAngle = (from, to) =>
  Math.atan2(to.point[1] - from.point[1], to.point[0] - from.point[0]);
const createVertex = (index, point) => ({
  index,
  point,
  outBoundEdges: [],
  addEdge(edge) {
    this.outBoundEdges.push(edge);
  },
});
const createEdge = (from, to) => {
  const angle = calculateAngle(from, to);
  const HEdge = {
    visited: false,
    from,
    to,
    angle,
    next: null,
    twin: null,
    setNext(edge) {
      this.next = edge;
    },
    setTwin(edge) {
      this.twin = edge;
    },
  };
  from.addEdge(HEdge);
  return HEdge;
};
