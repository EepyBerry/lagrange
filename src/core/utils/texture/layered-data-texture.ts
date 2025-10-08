import { DataTexture } from "three"

/**
 * DataTexture wrapper to manage multiple layers more efficiently, such as for biomes.
 * 
 * *Note: layers are stored in descending order.*
 */
export type LayerDrawOptions = { width?: number, height?: number }
export class LayeredDataTexture<DataObject> {

  private readonly _layers: OffscreenCanvas[] = []
  private readonly _workLayer: OffscreenCanvas
  private readonly _workLayerContext: OffscreenCanvasRenderingContext2D
  private readonly _texture: DataTexture
  private readonly _width: number
  private readonly _height: number
  private readonly _layerDrawFunc: (dataObj: DataObject, layerCtx: OffscreenCanvasRenderingContext2D, opts?: LayerDrawOptions) => void

  public get layers(): OffscreenCanvas[] {
    return this._layers
  }
  public get texture(): DataTexture {
    return this._texture
  }

  constructor(width: number, height: number, dataObjs: DataObject[], drawFunc: (dataObj: DataObject, layerCtx: OffscreenCanvasRenderingContext2D, opts?: LayerDrawOptions) => void) {
    this._width = width
    this._height = height
    this._layerDrawFunc = drawFunc
    this._workLayer = new OffscreenCanvas(width, height)
    this._workLayerContext = this._workLayer.getContext('2d', { willReadFrequently: true })!
    this._texture = new DataTexture(null, width, height)

    for (let i = 0; i < dataObjs.length; i++) {
      this.addLayer(dataObjs[i])
    }
  }

  public updateTexture() {
    this._workLayerContext.clearRect(0, 0, this._width, this._height)
    this._layers.toReversed().forEach(c => this._workLayerContext.drawImage(c, 0, 0))
    this._texture.image = this._workLayerContext.getImageData(0, 0, this._width, this._height)
    this._texture.needsUpdate = true
  }

  public updateLayer(index: number, data: DataObject) {
    const layer = this._layers.at(index)
    if (!layer) {
      console.warn(`Cannot update layer: layer at index ${index} does not exist`)
      return
    }
    this._layerDrawFunc(data, layer.getContext('2d')!, { width: this._width, height: this._height })
    this.updateTexture()
  }

  public addLayer(data: DataObject): OffscreenCanvas {
    const newLayer = new OffscreenCanvas(this._width, this._height)
    this._layers.push(newLayer)
    this._layerDrawFunc(data, newLayer.getContext('2d')!, { width: this._width, height: this._height })
    this.updateTexture()
    return newLayer
  }

  public removeLayer(index: number) {
    this._layers.splice(index, 1)
    this.updateTexture()
  }

  public moveLayer(index: number, diff: 1 | -1) {
    const element = this._layers[index]
    this._layers.splice(index, 1)
    this._layers.splice(index + diff, 0, element)
    this.updateTexture()
  }
}