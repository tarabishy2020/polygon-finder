import { createVertex, createEdge, createFace } from "./TypeHelpers";
export const createHalfEdgeStore = ({ vertices, edges, json }) => {
  /**
   * using an angle list matching `store.edges` sort the outgoing edges from a vertex based on their angle.
   * @param {Array} angles array of angles for each edge measure from positive x-axis
   */
  const sortEdgesAroundEachVertex = (angles) => {
    for (let i = 0; i < store.vertices.length; i++) {
      const vertex = store.vertices[i];
      vertex.outBoundEdgesIdx.sort(
        (edgeIdx, anotheredgeIdx) => angles[edgeIdx] - angles[anotheredgeIdx]
      );
      let prevIdx = vertex.outBoundEdgesIdx[vertex.outBoundEdgesIdx.length - 1];
      for (let j = 0; j < vertex.outBoundEdgesIdx.length; j++) {
        const edgeIdx = vertex.outBoundEdgesIdx[j];
        store.edges[store.edges[edgeIdx].twinIdx].nextIdx = prevIdx;
        prevIdx = edgeIdx;
      }
    }
  };
  /**
   * calculate angle between a line and the positive x-axis
   * @param {Array} from point [x,y]
     @param {Array} to point [x,y]
   * @returns 
   */
  const calculateAngle = (from, to) =>
    Math.atan2(to.point[1] - from.point[1], to.point[0] - from.point[0]);
  /**
   *
   * @param {int} edgeIdx index of the edge in `store.edges`
   * @param {function} propertySelector a function to return proerty of interest while jumping between edges. Defaults to returning edges traversed.
   * @returns
   */
  const iterateFaceFromEdgeIdx = (edgeIdx, propertySelector = (x) => x) => {
    const tempStore = [];
    const edge = store.edges[edgeIdx];
    let current = edge;
    do {
      tempStore.push(propertySelector(current));
      current = store.edges[current.nextIdx];
    } while (current !== edge);
    return tempStore;
  };
  /**
   * Given a face index return the indeces of neighboring faces that share an edge
   * @param {int} faceIdx index of face in `store.faces`
   * @returns {Array} indeces of neighboring faces
   */
  const getFaceNeighborsFromFaceIdx = (faceIdx) => {
    const edges = iterateFaceFromEdgeIdx(store.faces[faceIdx].edgeIdx);
    const neighborFaces = [];
    edges.map((edge) => {
      const newFaceIdx = store.edges[edge.twinIdx].faceIdx;
      if (!store.faces[newFaceIdx].border) neighborFaces.push(newFaceIdx);
    });
    return neighborFaces;
  };
  /**
   *
   * @param {int} rootIdx Face index to start branching from
   * @returns {Array} nested arrays, first level represents each depth step, second level of nesting represents children of a parent node in the previous level when flattened and cleaned.
   */
  const walkFromFaceIdx = (rootIdx) => {
    const levels = [];
    const toVisit = [];
    const visitedFaces = new Array(store.faces.length);
    toVisit.push([rootIdx]);
    visitedFaces[rootIdx] = true;
    let counter = 0;
    while (toVisit.length > 0 && counter < store.faces.length) {
      const thisLevel = toVisit.splice(0, toVisit.length);
      levels.push(thisLevel);
      for (let i = 0; i < thisLevel.length; i++) {
        const parents = thisLevel[i];
        for (let j = 0; j < parents.length; j++) {
          const faceIdx = parents[j];
          const edges = iterateFaceFromEdgeIdx(store.faces[faceIdx].edgeIdx);
          const tempStore = [];
          for (let m = 0; m < edges.length; m++) {
            const edge = edges[m];
            const newfaceIdx = store.edges[edge.twinIdx].faceIdx;
            if (!visitedFaces[newfaceIdx] && !store.faces[newfaceIdx].border) {
              tempStore.push(newfaceIdx);
              visitedFaces[newfaceIdx] = true;
            }
          }
          toVisit.push(tempStore);
        }
      }
      counter++;
    }
    return levels;
  };
  /**
   * Storage only elements we need to serialize/deserialize for this to work
   */
  const store = {
    vertices: [],
    edges: [],
    faces: [],
  };
  // timeComplexity: ((Avg.Valence log Avg.Valence) * v) + e
  const initialize = (vertices, edges) => {
    // timeComplexity: v
    store.vertices = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
      store.vertices[i] = createVertex(i, vertices[i]);
    }

    // timeComplexity: 2e
    const angles = new Array(edges.length * 2);
    store.edges = new Array(edges.length * 2);
    for (let i = 0; i < edges.length; i++) {
      const insertionIdx = i * 2;
      const fromIdx = edges[i][0];
      const toIdx = edges[i][1];
      const fromVtx = store.vertices[fromIdx];
      const toVtx = store.vertices[toIdx];
      store.edges[insertionIdx] = createEdge(insertionIdx, fromIdx, toIdx);
      angles[insertionIdx] = calculateAngle(fromVtx, toVtx);
      fromVtx.outBoundEdgesIdx.push(insertionIdx);
      store.edges[insertionIdx + 1] = createEdge(
        insertionIdx + 1,
        toIdx,
        fromIdx
      );
      angles[insertionIdx + 1] = calculateAngle(toVtx, fromVtx);
      toVtx.outBoundEdgesIdx.push(insertionIdx + 1);
      store.edges[insertionIdx].twinIdx = insertionIdx + 1;
      store.edges[insertionIdx + 1].twinIdx = insertionIdx;
    }

    // timeComplexity: (Avg.Valence log Avg.Valence) * v
    sortEdgesAroundEachVertex(angles);

    const visited = [];
    // timeComplexity: 2e
    let fInsertionIdx = 0;
    // counts edges! not the best way to detect border - could area be better?!
    // Don't count edge - check crv direction https://en.wikipedia.org/wiki/Curve_orientation#Practical_considerations
    // outer one will always be opposite to innser ones
    let faceEdgeCount = 0;
    let largestNumOfEdgesIdx = 0;
    for (const edge of store.edges) {
      if (visited[edge.index]) continue;
      let counter = 0;
      let current = edge;
      do {
        current.faceIdx = fInsertionIdx;
        visited[current.index] = true;
        current = store.edges[current.nextIdx];
        counter++;
      } while (current !== edge);
      store.faces.push(createFace(fInsertionIdx, edge.index));
      if (counter > faceEdgeCount) {
        largestNumOfEdgesIdx = fInsertionIdx;
        faceEdgeCount = counter;
      }
      fInsertionIdx++;
    }
    store.faces[largestNumOfEdgesIdx].border = true;
  };
  /**
   * deserialize store from json. Check "dumpToJson" function.
   * @param {string} json Json string containing {vertices, edges, faces}
   */
  const initializeJson = (json) => {
    const parsed = JSON.parse(json);
    if (!(parsed["vertices"] || parsed["edges"] || parsed["faces"])) {
      console.log("Need all keys:['vertices', 'edges', 'faces']");
    }
    store.vertices = parsed.vertices;
    store.edges = parsed.edges;
    store.faces = parsed.faces;
  };
  /**
   * serialize the store
   * @returns {string} serialized {vertices,edges,faces}
   */
  const dumpToJson = () => JSON.stringify(store);

  // decide if we are initializing from previously serialized data or from vertices and edges only
  if (vertices?.length > 0 && edges?.length > 0) {
    initialize(vertices, edges);
  } else if (json) {
    initializeJson(json);
  } else return undefined;
  return [
    store,
    {
      getFaceNeighborsFromFaceIdx,
      dumpToJson,
      walkFromFaceIdx,
      iterateFaceFromEdgeIdx,
    },
  ];
};
