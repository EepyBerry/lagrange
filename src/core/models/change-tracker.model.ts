export abstract class ChangeTracker {
  protected _changedProps: ChangedProp[] = []
  protected _changePrefix: string = ''

  public get changedProps() {
    return this._changedProps
  }
  public markForChange(prop: string, oldValue?: ChangedPropPair, newValue?: ChangedPropPair) {
    this._changedProps.push({ prop, oldValue, newValue })
  }
  public clearChangedProps() {
    this._changedProps.splice(0)
  }

  constructor(changedPropsRef?: ChangedProp[], changePrefix?: string) {
    if (changedPropsRef && changePrefix) {
      this._changedProps = changedPropsRef
      this._changePrefix = changePrefix
    }
  }
}

export type ChangedPropPair = { key: string, value: any }
export type ChangedProp = {
  prop: string
  oldValue?: ChangedPropPair
  newValue?: ChangedPropPair
}