export type LvgTabGroupTab = { icon: string; iconWidth: string; title: string; disabled?: boolean };
export type LgvTabGroupProps = {
  mode?: 'tabs' | 'sidebar';
  tabs: LvgTabGroupTab[];
};

export type LgvTabGroupExposes = {
  reset: () => void;
};
