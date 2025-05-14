export interface TSLMaterial<T, U extends object> {
  readonly uniforms: U
  get(): T
}