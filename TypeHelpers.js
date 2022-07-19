export const createVertex = (index = null, point = [], outBoundEdgesIdx = []) => ({
  index,
  point,
  outBoundEdgesIdx: [],
});
export const createEdge = (index,fromIdx, toIdx, angle,visited=false,nextIdx=null,twinIdx=null) => ({
  index,
  toIdx,
  fromIdx,
  angle,
  nextIdx,
  twinIdx,
});
