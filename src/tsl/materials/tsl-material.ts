export interface TSLMaterial<T, U extends object> {
  readonly uniforms: U
  build(): T
}