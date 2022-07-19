import "./style.css";
import {
  ctx,
  resizeCanvasFn,
  inputArea,
  buttonsContainer,
} from "./BasicCanvasSetup";
import { parseVEJson } from "../InputData";
import { createHalfEdgeStore } from "../HalfEdge";
import {averagePoints} from '../Utilities'
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

const renderHedgeFaces = ([{ vertices, edges, faces },{getFaceEdgesFromEdgeIdx}], renderCentroid = false) => {
  Object.entries(faces).map(([k, v],idx)=>{
    if(idx==9) return;
    ctx.fillStyle = getRandomColor();
    ctx.beginPath();
    const faceVertices = [];
    getFaceEdgesFromEdgeIdx(v.edgeIdx).map((edge,edgeIdx)=>{
      const startPt = vertices[edge.fromIdx].point;
      faceVertices.push(startPt);
      if (edgeIdx === 0) ctx.moveTo(...startPt);
      else ctx.lineTo(...startPt);
    });
    ctx.closePath();
    ctx.fill();
    if (renderCentroid) {
      const r = drawingThickness * 4;
      const avg = averagePoints(faceVertices);
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

// buttonsContainer;
inputArea.addEventListener("keyup", inputAreaTextChangedHandler, false);
window.addEventListener("resize", resizeCanvasHandler);
