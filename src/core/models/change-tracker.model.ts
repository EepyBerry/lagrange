export abstract class ChangeTracker {
  protected _changedProps: ChangedProp[] = []
  protected _changePrefix: string = ''

  public get changedProps() {
    return this._changedProps
  }
  public markForChange(prop: string, sourceId?: string, action: ChangeAction = ChangeAction.EDIT) {
    this._changedProps.push({ prop, sourceId, action })
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

export enum ChangeAction { ADD, EDIT, DELETE, SORT_UP, SORT_DOWN }
export type ChangedProp = {
  prop: string
  sourceId?: string
  action?: ChangeAction
}
