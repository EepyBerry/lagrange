export type DialogElementExposes = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  ignoreNativeEvents: (v: boolean) => void;
};
