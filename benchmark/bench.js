import { run, bench, group, baseline } from 'mitata';
import {example3} from "../exampleData";
import {createHalfEdgeStore} from "../HalfEdge";
import {createHalfEdgeStore as optimized} from "../HalfEdge-optimize";
const example = example3;

group('Initializing the store', () => {
    baseline('baseline', () => createHalfEdgeStore(example));
    bench('optimized', () => optimized(example));
  });

  await run({
    avg: true,
    json: false,
    colors: true, 
    min_max: true, 
    collect: false,
    percentiles: true,
  });