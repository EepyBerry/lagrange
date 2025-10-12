import type { Texture } from 'three'
import type { RingUniformData } from '@/core/tsl/materials/ring.tslmat'
import type { RingParameters } from '../ring-parameters.model'
import { ModelConverter } from './model-converter'

export class RingDataConverter extends ModelConverter<RingParameters, RingUniformData> {

  private _ringTexture: Texture

  constructor(data: RingParameters, tex: Texture) {
    super(data)
    this._ringTexture = tex
  }

  public convert(): RingUniformData {
    return {
      innerRadius: this._data.innerRadius,
      outerRadius: this._data.outerRadius,
      texture: this._ringTexture,
    }
  }
}
