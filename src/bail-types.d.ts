import type PlanetData from "./core/models/planet-data.model";

declare module '@vue/reactivity' {
  export interface RefUnwrapBailTypes {
      classes: PlanetData
  }
}