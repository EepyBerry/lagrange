import { clamp } from 'three/src/math/MathUtils.js'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'
import { Vector3 } from 'three'

export class NoiseParameters extends ChangeTracker {
  private _frequency: number = 3
  private _amplitude: number = 0.5
  private _lacunarity: number = 2
  private _octaves: number = 2
  
  private _layers: number = 1
  private _warpFactor: Vector3 = new Vector3(1.0)

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    freq?: number,
    amp?: number,
    lac?: number,
    oct?: number,
  ) {
    super(changedPropsRef, changePrefix)
    this._frequency = clamp(freq ?? this._frequency, 0, 10)
    this._amplitude = clamp(amp ?? this._amplitude, 0, 10)
    this._lacunarity = clamp(lac ?? this._lacunarity, 0, 10)
    this._octaves = clamp(oct ?? this._octaves, 0, 8)
    this._layers = 1.0
    this._warpFactor.setScalar(1.0)
  }

  public get frequency(): number {
    return this._frequency
  }
  public set frequency(value: number) {
    this._frequency = value
    this.markForChange(`${this._changePrefix}._frequency`)
  }

  public get amplitude(): number {
    return this._amplitude
  }
  public set amplitude(value: number) {
    this._amplitude = value
    this.markForChange(`${this._changePrefix}._amplitude`)
  }

  public get lacunarity(): number {
    return this._lacunarity
  }
  public set lacunarity(value: number) {
    this._lacunarity = value
    this.markForChange(`${this._changePrefix}._lacunarity`)
  }

  public get octaves(): number {
    return this._octaves
  }
  public set octaves(value: number) {
    this._octaves = value
    this.markForChange(`${this._changePrefix}._octaves`)
  }

  public get layers(): number {
    return this._layers
  }
  public set layers(value: number) {
    this._layers = Math.round(clamp(value, 1, 3))
    this.markForChange(`${this._changePrefix}._layers`)
  }

  public get warpFactor(): Vector3 {
    return this._warpFactor
  }
  
  public get xWarpFactor(): number {
    return this._warpFactor.x
  }
  public set xWarpFactor(value: number) {
    this._warpFactor.x = value
    this.markForChange(`${this._changePrefix}._warpFactor`)
  }
  public get yWarpFactor(): number {
    return this._warpFactor.y
  }
  public set yWarpFactor(value: number) {
    this._warpFactor.y = value
    this.markForChange(`${this._changePrefix}._warpFactor`)
  }
  public get zWarpFactor(): number {
    return this._warpFactor.z
  }
  public set zWarpFactor(value: number) {
    this._warpFactor.z = value
    this.markForChange(`${this._changePrefix}._warpFactor`)
  }

  public loadData(data?: NoiseParameters) {
    this.frequency = clamp(data?._frequency ?? this._frequency, 0, 10)
    this.amplitude = clamp(data?._amplitude ?? this._amplitude, 0, 10)
    this.lacunarity = clamp(data?._lacunarity ?? this._lacunarity, 0, 10)
    this.octaves = clamp(data?._octaves ?? this._octaves, 0, 8)
    this.layers = clamp(data?._layers ?? 1, 1, 3)
    this.xWarpFactor = data?._warpFactor ? data._warpFactor.x : 1.0
    this.yWarpFactor = data?._warpFactor ? data._warpFactor.y : 1.0
    this.zWarpFactor = data?._warpFactor ? data._warpFactor.z : 1.0
  }

  public reset(freq: number, amp: number, lac: number, oct: number, layers?: number, warpScalar?: number): void {
    this.frequency = clamp(freq, 0, 10)
    this.amplitude = clamp(amp, 0, 10)
    this.lacunarity = clamp(lac, 0, 10)
    this.octaves = clamp(oct, 0, 8)
    this.layers = clamp(layers ?? 1, 1, 3)
    this.xWarpFactor = 1.0
    this.yWarpFactor = 1.0
    this.zWarpFactor = 1.0
  }
}
