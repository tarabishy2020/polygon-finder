/**
 * Given a json containing {vertices:[[x,y],..],edges:[[vertexIdx,vertexIdx]]} parse and return the data
 * @param {string} json 
 * @returns {Object}
 */
export const parseVEJson = (json) => {
  if (!json) return null;

  try {
    const parsed = JSON.parse(json, (k, v) => {
      return typeof v === "object" || isNaN(v) ? v : parseFloat(v);
    });
    if (!(parsed["vertices"] || parsed["edges"])) {
      console.log("Need all keys:['vertices', 'edges']");
      return null;
    }
    const DataStore = CreateInputDataStore();
    DataStore.addVertices(parsed["vertices"]);
    DataStore.addEdges(parsed["edges"]);
    return DataStore;
  } catch (e) {
    console.log(e);
  }
};

export const CreateInputDataStore =()=>({
  vertices: [],
  edges: [],
  addVertex: ([x, y]) => {
    const idx = this.vertices.length;
    this.vertices.push([x, y]);
    return idx;
  },
  addVertices(x) {
    this.vertices = [...this.vertices, ...x];
  },
  addEdge([p1, p2]) {
    this.edges.push([p1, p2]);
  },
  addEdges(x) {
    this.edges = [...this.edges, ...x];
  },
  clear() {
    this.vertices.length = 0;
    this.edges.length = 0;
  },
});