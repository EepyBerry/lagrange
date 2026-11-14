export type LogLevel = 'success' | 'info' | 'alert' | 'error';
export type LogEventTypeMap = {
  success: { message: string };
  info: { message: string };
  alert: { message: string };
  error: { error: Error | string };
};
export type LogEventHandlers = {
  [L in LogLevel]: (p: LogEventTypeMap[L]) => void;
};

export type InternalLogEntry = {
  id: string;
  level: LogLevel;
  text: string;
  isStackTrace?: boolean;
};

export type LgvLogBlockExposes = {
  log: <L extends LogLevel>(level: L, params: LogEventTypeMap[L]) => void;
  clear: () => void;
};
