export abstract class ChangeTracker {
  protected _changedProps: ChangedProp[] = [];
  protected _changePrefix: string = '';

  public get changedProps() {
    return this._changedProps;
  }
  public markForChange(prop: string, source?: ChangeSource, action: ChangeAction = ChangeAction.EDIT) {
    this._changedProps.push({ prop, source, action });
  }
  public clearChangedProps() {
    this._changedProps.splice(0);
  }

  /**
   * Marks all properties of this object for change. Should be overriden in subclasses when necessary
   */
  public markAllForChange(): void {
    this.changedProps.push(...Object.keys(this).map((k) => ({ prop: k, action: ChangeAction.EDIT })));
  }

  constructor(changedPropsRef?: ChangedProp[], changePrefix?: string) {
    if (changedPropsRef && changePrefix) {
      this._changedProps = changedPropsRef;
      this._changePrefix = changePrefix;
    }
  }
}

export type ChangeSource = { arrayIndex?: number; data?: unknown };
export enum ChangeAction {
  ADD = 'ADD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SORT_UP = 'SORT_UP',
  SORT_DOWN = 'SORT_DOWN',
}
export type ChangedProp = {
  prop: string;
  source?: ChangeSource;
  action?: ChangeAction;
};
