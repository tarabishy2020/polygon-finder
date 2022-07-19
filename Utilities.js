export const calculateAngle = (from, to) =>
  Math.atan2(to.point[1] - from.point[1], to.point[0] - from.point[0]);

export const sortEdges = (vertex) => {
  vertex.outBoundEdges.sort(
    (edge, anotheredge) => edge.angle - anotheredge.angle
  );
  let prev = vertex.outBoundEdges[vertex.outBoundEdges.length - 1];
  for (const edge of vertex.outBoundEdges) {
    edge.next = prev;
    prev = edge;
  }
};
