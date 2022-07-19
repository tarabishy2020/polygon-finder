export const averagePoints = (pts) => {
    const length = pts.length;
    const avg = new Array(pts[0].length).fill(0);
    pts.map((pt) => pt.map((item, idx) => (avg[idx] += item)));
    return avg.map((x) => x / length*1.0);
  };
