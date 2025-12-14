export function makeSVGLinearPath(start: number[], end: number[], stops: number) {
  let path: string = `M${start[0]},${start[1]}`;
  const curValues: number[] = [start[0], start[1]];
  for (let i = 0; i < stops; i++) {
    curValues[0] += (end[0] - start[0]) / (stops + 1.0);
    curValues[1] += (end[1] - start[1]) / (stops + 1.0);
    path += ` ${curValues[0]},${curValues[1]}`;
  }
  return path + ' ' + end;
}

function _polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
export function makeSVGCircleArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = _polarToCartesian(x, y, radius, endAngle);
  const end = _polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}
