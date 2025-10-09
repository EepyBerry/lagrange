import saveAs from 'file-saver'
import { nanoid } from 'nanoid'
import { DataTexture } from 'three'

/**
 * DataTexture wrapper to manage multiple layers more efficiently, such as for biomes.
 *
 * *Note: layers are stored in descending order.*
 */
export type LayerDrawOptions = { width?: number; height?: number }
export type Layer = { id: string; canvas: OffscreenCanvas }
export class LayeredDataTexture<DataObject> {
  private readonly _layers: Layer[] = []
  private readonly _workCanvas: OffscreenCanvas
  private readonly _texture: DataTexture
  private readonly _width: number
  private readonly _height: number
  private readonly _layerDrawFunc: (
    dataObj: DataObject,
    layerCtx: OffscreenCanvasRenderingContext2D,
    opts?: LayerDrawOptions,
  ) => void

  public get layers(): Layer[] {
    return this._layers
  }
  public get texture(): DataTexture {
    return this._texture
  }

  constructor(
    width: number,
    height: number,
    dataObjs: DataObject[],
    drawFunc: (dataObj: DataObject, layerCtx: OffscreenCanvasRenderingContext2D, opts?: LayerDrawOptions) => void,
  ) {
    this._width = width
    this._height = height
    this._layerDrawFunc = drawFunc
    this._workCanvas = new OffscreenCanvas(width, height)
    this._texture = new DataTexture(null, width, height)

    for (let i = 0; i < dataObjs.length; i++) {
      this.addLayer(dataObjs[i])
    }
    this.updateTexture()
  }

  public dispose() {
    this._layers.splice(0)
    this._texture.dispose()
  }

  public debugSaveTexture() {
    saveAs(new Blob([this._texture.image.data as BlobPart]), 'layeredtex.raw')
  }

  public updateTexture() {
    const ctx = this._workCanvas.getContext('2d', { willReadFrequently: true })!
    ctx.clearRect(0, 0, this._width, this._height)
    this._layers.toReversed().forEach((layer) => ctx.drawImage(layer.canvas, 0, 0))
    this._texture.image = ctx.getImageData(0, 0, this._width, this._height)
    this._texture.needsUpdate = true
  }

  public updateLayer(index: number, data: DataObject) {
    const layer = this._layers.at(index)
    if (!layer) {
      console.warn(`Cannot update layer: layer at index ${index} does not exist`)
      return
    }
    this._layerDrawFunc(data, layer.canvas.getContext('2d', { willReadFrequently: true })!, {
      width: this._width,
      height: this._height,
    })
    this.updateTexture()
  }

  public addLayer(data: DataObject): Layer {
    const newLayer = { id: nanoid(), canvas: new OffscreenCanvas(this._width, this._height) }
    this._layers.push(newLayer)
    this._layerDrawFunc(data, newLayer.canvas.getContext('2d', { willReadFrequently: true })!, {
      width: this._width,
      height: this._height,
    })
    this.updateTexture()
    return newLayer
  }

  public removeLayer(index: number) {
    this._layers.splice(index, 1)
    this.updateTexture()
  }

  public moveLayer(index: number, diff: -1 | 1) {
    console.log(this._layers)
    const element = this._layers[index]
    this._layers.splice(index, 1)
    this._layers.splice(index + diff, 0, element)
    this.updateTexture()
    console.log(this._layers)
  }
}
