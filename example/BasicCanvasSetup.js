import * as Examples from "../exampleData/index";

/**
 * Given the ID for an html element create an html5 canvas
 * @param {string} parentNodeId
 * @returns {Array} Canvas' 2d context, resize handler
 */
const createCanvas = (parentNodeId) => {
  const element = document.createElement("canvas");
  const container = document.getElementById(parentNodeId);
  element.className = "canvas";
  container.appendChild(element);
  const ctx = element.getContext("2d");
  const resize = () => {
    element.width = element.offsetWidth;
    element.height = element.offsetHeight;
    ctx.translate(element.width / 2, element.height / 2);
    ctx.scale(100, 100);
  };
  resize();
  return [ctx, resize];
};
/**
 * Given the ID for an html element create the input area for json data
 * @param {string} parentNodeId
 * @returns {HTMLTextAreaElement}
 */
const createInputArea = (parentNodeId) => {
  const element = document.createElement("textarea");
  const container = document.getElementById(parentNodeId);
  element.className = "input-area";
  container.appendChild(element);
  return element;
};
// https://stackoverflow.com/a/9722502
// Provide a way to clear the canvas from the 2d context reference
CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear ||
  function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
  };
/**
 * Add example buttons, return the div containing the buttons
 * @param {string} parentNodeId 
 * @param {HTMLTextAreaElement} inputArea 
 * @returns {HTMLDivElement}
 */
const addExampleButtons = (parentNodeId, inputArea) => {
  const element = document.createElement("div");
  const container = document.getElementById(parentNodeId);
  console.log(container);
  container.lastChild.before(element);
  element.className = "example-buttons";

  Object.entries(Examples).map(([k, v]) => {
    const btn = document.createElement("button");
    btn.innerHTML = k;
    element.appendChild(btn);
    btn.onclick = () => {
      inputArea.value = JSON.stringify(v);
      inputArea.dispatchEvent(new Event("keyup"));
    };
  });
  return element;
};
const createButton=(parent,text,onClickHandler)=>{
  const btn = document.createElement("button");
  parent.appendChild(btn);
  btn.innerHTML = text;
  btn.onclick = onClickHandler
  return btn
}
export const [ctx, resizeCanvasFn] = createCanvas("app");
export const inputArea = createInputArea("app");
export const buttonsContainer= addExampleButtons("app", inputArea);
