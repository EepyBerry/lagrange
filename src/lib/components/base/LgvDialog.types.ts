export type LgvDialogExposes = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  ignoreNativeEvents: (v: boolean) => void;
};
