export default class Rect {
  private _x: number
  private _y: number
  private _w: number
  private _h: number

  public get x(): number {
    return this._x
  }
  public set x(value: number) {
    this._x = value
  }

  public get y(): number {
    return this._y
  }
  public set y(value: number) {
    this._y = value
  }

  public get w(): number {
    return this._w
  }
  public set w(value: number) {
    this._w = value
  }

  public get h(): number {
    return this._h
  }
  public set h(value: number) {
    this._h = value
  }

  constructor(x: number, y: number, w: number, h: number) {
    this._x = x
    this._y = y
    this._w = w
    this._h = h
  }

  /**
   * Finds overlaps on a given w*h plane's borders with this Rect
   * @param w total plane width
   * @param h total plane height
   * @returns an array containing overlaps for the top, right, bottom & left sides, in that order
   */
  public findOverlaps(w: number, h: number): boolean[] {
    const borderOverlaps: boolean[] = [false, false, false, false]
    borderOverlaps[0] = this.y === 0
    borderOverlaps[1] = this.x + this.w >= w
    borderOverlaps[2] = this.y + this.h >= h
    borderOverlaps[3] = this.x === 0
    return borderOverlaps
  }

  /**
   * Finds the nearest point on this rect from the given (x,y) coordinates within that rect
   * @param px point x
   * @param py point y
   * @returns the coordinates of the nearest rect point from (x,y)
   */
  public findMinDistanceWithin(px: number, py: number, overlaps: boolean[]): number {
    return Math.min(
      overlaps[3] ? 1e3 : px - this.x,
      overlaps[0] ? 1e3 : py - this.y,
      overlaps[1] ? 1e3 : this.x + this.w - px,
      overlaps[2] ? 1e3 : this.y + this.h - py,
    )
  }
}