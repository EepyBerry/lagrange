export abstract class ChangeTracker {
  protected _changedProps: string[] = []
  protected _changePrefix: string = ''

  public get changedProps() {
    return this._changedProps
  }
  public markForChange(prop: string) {
    this._changedProps.push(prop)
  }
  public clearChangedProps() {
    this._changedProps.splice(0)
  }

  constructor(changedPropsRef?: string[], changePrefix?: string) {
    if (changedPropsRef && changePrefix) {
      this._changedProps = changedPropsRef
      this._changePrefix = changePrefix
    }
  }
}