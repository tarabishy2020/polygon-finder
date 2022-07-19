export const createVertex = (index = null, point = [], outBoundEdgesIdx = []) => ({
  index,
  point,
  outBoundEdgesIdx: [],
});
export const createEdge = (index,from, to, angle,visited=false,nextIdx=null,twinIdx=null) => ({
  index,
  visited,
  to,
  from,
  angle,
  nextIdx,
  twinIdx,
});
