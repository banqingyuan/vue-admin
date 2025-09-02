export enum ToastType {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
}
