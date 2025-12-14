export abstract class ModelConverter<D, T> {
  protected _data: D;
  public abstract convert(): T;

  constructor(data: D) {
    this._data = data;
  }
}
