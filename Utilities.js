export const calculateAngle = (from, to) =>
  Math.atan2(to.point[1] - from.point[1], to.point[0] - from.point[0]);

export const sortEdgesAroundEachVertex = (halfEdgeStore) => {
    halfEdgeStore.vertices.map(vertex=>{
        vertex.outBoundEdgesIdx.sort(
          (edgeIdx, anotheredgeIdx) => halfEdgeStore.edges[edgeIdx].angle - halfEdgeStore.edges[anotheredgeIdx].angle
        );
        let prevIdx = vertex.outBoundEdgesIdx[vertex.outBoundEdgesIdx.length - 1];
        for (const edgeIdx of vertex.outBoundEdgesIdx) {
            halfEdgeStore.edges[edgeIdx].nextIdx = prevIdx;
            prevIdx = edgeIdx;
        }
    })
};
export const averagePoints = (pts) => {
    const length = pts.length;
    const avg = new Array(pts[0].length).fill(0);
    pts.map((pt) => pt.map((item, idx) => (avg[idx] += item)));
    return avg.map((x) => x / length*1.0);
  };