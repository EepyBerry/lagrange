export interface TSLMaterial<T, U extends object> {
  readonly uniforms: U
  buildMaterial(): T
}