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
  },0.5)`;

const drawLine = (from, to) => {
  ctx.beginPath();
  ctx.lineWidth = drawingThickness;
  ctx.moveTo(...from);
  ctx.lineTo(...to);
  ctx.stroke();
};
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
  const r = drawingThickness * 4;
  for (const vertex of vertices) {
    ctx.beginPath();
    ctx.arc(...vertex, r, 0, 2 * Math.PI, false);
    ctx.fill();
  }
};
const renderFaceNeighbors = (json, idx) => {
  const [
    { vertices, faces },
    { iterateFaceFromEdgeIdx, getFaceNeighborsFromFaceName },
  ] = createHalfEdgeStore({ json });
  if (Object.keys(faces).length < idx) return;
  render(parsed);
  const faceName = Object.keys(faces)[idx];
  const centroidFromName = (name) => {
    const selectedFacePoints = iterateFaceFromEdgeIdx(
      faces[name].edgeIdx,
      (x) => vertices[x.fromIdx].point
    );
    return averagePoints(selectedFacePoints);
  };
  const from = centroidFromName(faceName);
  const neighborNames = getFaceNeighborsFromFaceName(faceName);
  const neighborCentroids = neighborNames.map((name) => centroidFromName(name));
  neighborCentroids.map((to) => drawLine(from, to));
};
const renderHedgeFaces = (
  [{ vertices, edges, faces }, { iterateFaceFromEdgeIdx }],
  renderCentroid = false
) => {
  Object.entries(faces).map(([k, face], idx) => {
    if (idx == 9) return;
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
      ctx.beginPath();
      ctx.arc(...avg, r, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.font = `0.01em sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(idx, ...avg, 50);
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
