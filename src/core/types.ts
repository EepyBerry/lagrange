export enum GeometryType {
  SPHERE,
  TORUS,
  BOX,
}
export enum NoiseType {
  FBM,
  PERLIN,
}
export enum ColorMode {
  REALISTIC,
  DIRECT,
  MIXED,
}

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'
