import "./style.css";
import {
  ctx,
  resizeCanvasFn,
  inputArea,
  buttonsContainer,
  indexInput,
  spreadButton,
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
const drawArc = (vertex, r = drawingThickness * 4) => {
  ctx.beginPath();
  ctx.arc(...vertex, r, 0, 2 * Math.PI, false);
  ctx.fill();
};
const drawFace = (vertices) => {
  vertices.map((vertex, idx) => {
    if (idx === 0) ctx.moveTo(...vertex);
    else ctx.lineTo(...vertex);
  });
};
const renderInputData = ({ edges, vertices }, renderIdx = false) => {
  for (let i = 0; i < edges.length; i++) {
    const v1 = vertices[edges[i][0]]
    const v2 = vertices[edges[i][1]]
    drawLine(v1, v2);
    if(renderIdx){
      const avg = averagePoints([v1,v2]);
      ctx.fillStyle = "rgba(0,0,0,1)";
      drawArc(avg, drawingThickness * 2);
      ctx.font = `0.01em sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`E: ${i}`, ...avg, 50);
    }
  }
  for (let i = 0; i < vertices.length; i++) {
    drawArc(vertices[i]);
    if(renderIdx){
      ctx.fillStyle = "rgba(0,0,0,1)";
      drawArc(vertices[i], drawingThickness * 2);
      ctx.font = `0.01em sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`V: ${i}`, ...vertices[i], 50);
    }
  }
};
const centroidFromFaceIdx = (
  faceIdx,
  iterateFaceFromEdgeIdx,
  vertices,
  faces
) => {
  const selectedFacePoints = iterateFaceFromEdgeIdx(
    faces[faceIdx].edgeIdx,
    (x) => vertices[x.fromIdx].point
  );
  return averagePoints(selectedFacePoints);
};
const renderFaceNeighbors = (json, idx) => {
  const [
    { vertices, faces },
    { iterateFaceFromEdgeIdx, getFaceNeighborsFromFaceIdx },
  ] = createHalfEdgeStore({ json });
  if (faces.length < idx) return;
  render(parsed);
  const from = centroidFromFaceIdx(
    idx,
    iterateFaceFromEdgeIdx,
    vertices,
    faces
  );
  const neighborsIdx = getFaceNeighborsFromFaceIdx(idx);
  const neighborCentroids = neighborsIdx.map((id) =>
    centroidFromFaceIdx(id, iterateFaceFromEdgeIdx, vertices, faces)
  );
  neighborCentroids.map((to) => drawLine(from, to));
};
const renderWalkers = (json, idx) => {
  const [{ vertices, faces }, { iterateFaceFromEdgeIdx, walkFromFaceIdx }] =
    createHalfEdgeStore({ json });
  const levels = walkFromFaceIdx(idx);
  for (let i = 0; i < levels.length - 2; i++) {
    const current = levels[i].flat();
    current.map((fromFace, idx) => {
      const from = centroidFromFaceIdx(
        fromFace,
        iterateFaceFromEdgeIdx,
        vertices,
        faces
      );
      levels[i + 1][idx]?.map((toFace) => {
        const to = centroidFromFaceIdx(
          toFace,
          iterateFaceFromEdgeIdx,
          vertices,
          faces
        );
        drawLine(from, to);
      });
    });
  }
};
const renderHedgeFaces = (
  [{ vertices, edges, faces }, { iterateFaceFromEdgeIdx }],
  renderCentroid = false
) => {
  faces.map((face) => {
    if (face.border) return;
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
      drawArc(avg, drawingThickness * 2);
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
  if (parsed?.halfEdgeStructure && e.target.value)
    renderFaceNeighbors(
      parsed?.halfEdgeStructure[1].dumpToJson(),
      Number(e.target.value)
    );
};
const SpreadButtonPressedHandler = () => {
  const index = indexInput.value;
  if (parsed?.halfEdgeStructure && index)
    renderWalkers(parsed?.halfEdgeStructure[1].dumpToJson(), Number(index));
};
window.addEventListener("resize", resizeCanvasHandler);
indexInput.addEventListener("keyup", NeighborVisualizerInputHandler, false);
spreadButton.onclick = SpreadButtonPressedHandler;
inputArea.addEventListener("keyup", inputAreaTextChangedHandler, false);
