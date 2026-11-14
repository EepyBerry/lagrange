export type RectOverlaps = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export default class Rect {
  private _x: number;
  private _y: number;
  private _w: number;
  private _h: number;

  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value;
  }

  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
  }

  public get w(): number {
    return this._w;
  }
  public set w(value: number) {
    this._w = value;
  }

  public get h(): number {
    return this._h;
  }
  public set h(value: number) {
    this._h = value;
  }

  constructor(x: number, y: number, w: number, h: number) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
  }

  /**
   * Finds overlaps on a given w*h plane's borders with this Rect
   * @param w total plane width
   * @param h total plane height
   * @returns an object containing overlaps for the top, right, bottom, and left sides
   */
  public findPlaneBorderOverlaps(w: number, h: number): RectOverlaps {
    const borderOverlaps: RectOverlaps = { top: false, right: false, bottom: false, left: false };
    borderOverlaps.top = this.y <= 0;
    borderOverlaps.right = this.x + this.w >= w;
    borderOverlaps.bottom = this.y + this.h >= h;
    borderOverlaps.left = this.x <= 0;
    return borderOverlaps;
  }
}
