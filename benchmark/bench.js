import { run, bench, group, baseline } from "mitata";
import { example2, example3, example5 } from "../exampleData";
import { createHalfEdgeStore } from "../HalfEdge";
import { createHalfEdgeStore as optimized } from "../HalfEdge-optimize";
const examples = [example3];

group("Initializing the store", () => {
  baseline("optimized", () => {
    for (const example of examples) {
      const result = optimized(example);
      return result;
    }
  });
  bench("baseline", () => {
    for (const example of examples) {
      const result = createHalfEdgeStore(example);
      return result;
    }
  });
});
group("Walking all faces", () => {
  baseline("optimized", () => {
    for (const example of examples) {
      const [store, { walkFromFaceIdx }] = optimized(example);
      const levels = walkFromFaceIdx(0);
      return levels;
    }
  });
  bench("baseline", () => {
    for (const example of examples) {
      const [store, { walkFromFaceIdx }] = createHalfEdgeStore(example);
      const levels = walkFromFaceIdx(0);
      return levels;
    }
  });
});
await run({
  avg: true,
  json: false,
  colors: true,
  min_max: true,
  collect: false,
  percentiles: true,
});
