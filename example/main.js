import "./style.css";
import {
  ctx,
  resizeCanvasFn,
  inputArea,
  buttonsContainer,
  indexInput,
} from "./BasicCanvasSetup";
import { parseVEJson } from "../InputData";
import { createHalfEdgeStore } from "../HalfEdge";
import { averagePoints } from "../Utilities";
let parsed = null;
const drawingThickness = 0.01;

const getRandomColor = () =>
  `rgba(${255 * Math.random()},${255 * Math.random()},${
    255 * Math.random()
  },0.3)`;

const drawLine = (from, to) => {
  ctx.beginPath();
  ctx.lineWidth = drawingThickness;
  ctx.moveTo(...from);
  ctx.lineTo(...to);
  ctx.stroke();
};
const drawArc=(vertex, r=drawingThickness * 4)=>{
  ctx.beginPath();
  ctx.arc(...vertex, r, 0, 2 * Math.PI, false);
  ctx.fill();
}
const drawFace = (vertices) => {
  vertices.map((vertex, idx) => {
    if (idx === 0) ctx.moveTo(...vertex);
    else ctx.lineTo(...vertex);
  });
};
const renderInputData = ({ edges, vertices }) => {
  for (const edge of edges) {
    drawLine(vertices[edge[0]], vertices[edge[1]]);
  }
  for (const vertex of vertices) {
    drawArc(vertex)
  }
};
const renderFaceNeighbors = (json, idx) => {
  const [
    { vertices, faces },
    { iterateFaceFromEdgeIdx, getFaceNeighborsFromFaceIdx },
  ] = createHalfEdgeStore({ json });
  if (faces.length < idx) return;
  render(parsed);
  const centroidFromFaceIdx = (faceIdx) => {
    const selectedFacePoints = iterateFaceFromEdgeIdx(
      faces[faceIdx].edgeIdx,
      (x) => vertices[x.fromIdx].point
    );
    return averagePoints(selectedFacePoints);
  };
  const from = centroidFromFaceIdx(idx);
  const neighborsIdx = getFaceNeighborsFromFaceIdx(idx);
  const neighborCentroids = neighborsIdx.map((id) => centroidFromFaceIdx(id));
  neighborCentroids.map((to) => drawLine(from, to));
};
const renderHedgeFaces = (
  [{ vertices, edges, faces }, { iterateFaceFromEdgeIdx }],
  renderCentroid = false
) => {
  faces.map((face) => {
    if (face.index == 9) return;
    ctx.fillStyle = getRandomColor();
    const faceVertices = iterateFaceFromEdgeIdx(
      face.edgeIdx,
      (x) => vertices[x.fromIdx].point
    );
    ctx.beginPath();
    drawFace(faceVertices);
    ctx.closePath();
    ctx.fill();
    if (renderCentroid) {
      const r = drawingThickness * 4;
      const avg = averagePoints(faceVertices);
      ctx.fillStyle = "rgba(0,0,0,1)";
      drawArc(avg, drawingThickness*2)
      ctx.font = `0.01em sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(face.index, ...avg, 50);
    }
  });
};
const render = (data) => {
  if (!data?.parsed) return;
  ctx.clear(true);
  ctx.save();
  if (data?.halfEdgeStructure) {
    renderHedgeFaces(data.halfEdgeStructure, true);
    ctx.restore();
  }
  renderInputData(data.parsed);
};
const resizeCanvasHandler = () => {
  resizeCanvasFn();
  render(parsed);
};
const inputAreaTextChangedHandler = (e) => {
  let parsedInput = parseVEJson(e.target.value);
  let halfEdgeStructure = parsedInput && createHalfEdgeStore(parsedInput);
  parsed = { parsed: parsedInput, halfEdgeStructure: halfEdgeStructure };
  render(parsed);
};
const NeighborVisualizerInputHandler = (e) => {
  if (parsed?.halfEdgeStructure)
    renderFaceNeighbors(
      parsed?.halfEdgeStructure[1].dumpToJson(),
      Number(e.target.value)
    );
};
inputArea.addEventListener("keyup", inputAreaTextChangedHandler, false);
indexInput.addEventListener("keyup", NeighborVisualizerInputHandler, false);
window.addEventListener("resize", resizeCanvasHandler);
