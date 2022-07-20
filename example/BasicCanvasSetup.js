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
    let width = window?.devicePixelRatio > 1 ?  container.offsetWidth * window.devicePixelRatio : container.offsetWidth;
    let height = window?.devicePixelRatio > 1 ? container.offsetHeight * window.devicePixelRatio : container.offsetWidth;
    let smaller = Math.min(width, height)
    element.width = smaller;
    element.height = smaller;
    element.style.width = `${smaller}px`;
    element.style.height = `${smaller}px`;
    ctx.translate(smaller / 2,smaller / 2);
    let mult = smaller / 12
    ctx.scale(mult, mult);
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
  // Input area used to feed a face index
  const indexInput = document.createElement("input");
  indexInput.placeholder='enter index';
  element.appendChild(indexInput)
  // Face walker
  const spreadButton = document.createElement("button");
  spreadButton.innerHTML = "spread from index";
  element.appendChild(spreadButton);

  return [element, indexInput, spreadButton];
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
export const [buttonsContainer, indexInput, spreadButton]= addExampleButtons("app", inputArea);
