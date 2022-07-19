export const createVertex = (index = null, point = [], outBoundEdges = []) => ({
  index,
  point,
  outBoundEdges: [],
});
export const createEdge = (from, to, angle,visited=false,next=null,twin=null) => ({
  visited,
  to,
  from,
  angle,
  next,
  twin,
});
