import "./style.css";
import {
  ctx,
  resizeCanvasFn,
  inputArea,
  buttonsContainer,
} from "./BasicCanvasSetup";
import { parseVEJson } from "../InputData";
import { createHalfEdgeStore } from "../HalfEdge";

let parsed = null;
const drawingThickness = 0.01;
const getRandomColor = () =>
  `rgba(${255 * Math.random()},${255 * Math.random()},${
    255 * Math.random()
  },0.5)`;

const renderInputData = ({ edges, vertices }) => {
  for (const edge of edges) {
    ctx.beginPath();
    ctx.lineWidth = drawingThickness;
    ctx.moveTo(...vertices[edge[0]]);
    ctx.lineTo(...vertices[edge[1]]);
    ctx.stroke();
  }
  const r = drawingThickness * 4;
  for (const vertex of vertices) {
    ctx.beginPath();
    ctx.arc(...vertex, r, 0, 2 * Math.PI, false);
    ctx.fill();
  }
};
const averagePoints = (pts) => {
  const length = pts.length;
  const avg = new Array(pts[0].length).fill(0);
  pts.map((pt) => pt.map((item, idx) => (avg[idx] += item)));
  return avg.map((x) => x / length*1.0);
};
const renderHedgeFaces = ({ edges, faces }, renderCentroid = false) => {
  console.log(faces.length)
  faces.map((face, idx) => {
    if(idx==9) return;
    ctx.fillStyle = getRandomColor();
    ctx.beginPath();
    const faceVertices = [];
    face.map((globalEdgeIdx, faceEdgeIdx) => {
      const startPt = edges[globalEdgeIdx].from.point;
      faceVertices.push(startPt);
      if (faceEdgeIdx === 0) ctx.moveTo(...startPt);
      else ctx.lineTo(...startPt);
    });
    ctx.closePath();
    ctx.fill();
    if (renderCentroid) {
      const r = drawingThickness * 4;
      const avg = averagePoints(faceVertices);
      // console.log(avg)
      ctx.fillStyle='rgba(0,0,0,1)'
      ctx.beginPath();
      ctx.arc(...avg, r, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.font = `0.01em sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(idx, ...avg,50); 
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

buttonsContainer;
inputArea.addEventListener("keyup", inputAreaTextChangedHandler, false);
window.addEventListener("resize", resizeCanvasHandler);