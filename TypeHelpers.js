export const createVertex = (
  index = null,
  point = [],
  outBoundEdgesIdx = []
) => ({
  index,
  point,
  outBoundEdgesIdx: [],
});
export const createEdge = (
  index,
  fromIdx,
  toIdx,
  visited = false,
  nextIdx = null,
  twinIdx = null,
  faceIdx = null
) => ({
  index,
  toIdx,
  fromIdx,
  faceIdx,
  nextIdx,
  twinIdx,
});
export const createFace = (index,edgeIdx, border = false) => ({
  index,edgeIdx, border
});
