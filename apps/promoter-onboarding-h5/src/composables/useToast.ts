import { createApp, h } from 'vue';
import Toast from '#/components/ui/Toast.vue';

interface ToastOptions {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
}

let toastInstance: any = null;
let toastContainer: HTMLDivElement | null = null;

function showToast(options: ToastOptions) {
  // 如果已经有Toast实例，先清除
  if (toastInstance) {
    hideToast();
  }

  // 创建容器
  toastContainer = document.createElement('div');
  document.body.appendChild(toastContainer);

  // 创建Toast实例
  toastInstance = createApp({
    setup() {
      return () => h(Toast, {
        message: options.message,
        type: options.type || 'info',
        duration: options.duration || 3000,
        visible: true,
        onClose: () => {
          hideToast();
        },
      });
    },
  });

  toastInstance.mount(toastContainer);
}

function hideToast() {
  if (toastInstance) {
    toastInstance.unmount();
    toastInstance = null;
  }
  if (toastContainer && toastContainer.parentNode) {
    toastContainer.parentNode.removeChild(toastContainer);
    toastContainer = null;
  }
}

export function useToast() {
  return {
    show: (message: string, type: 'error' | 'success' | 'info' = 'info', duration = 3500) => {
      showToast({ message, type, duration });
    },
    error: (message: string, duration = 3500) => {
      showToast({ message, type: 'error', duration });
    },
    success: (message: string, duration = 3500) => {
      showToast({ message, type: 'success', duration });
    },
    info: (message: string, duration = 3500) => {
      showToast({ message, type: 'info', duration });
    },
    hide: hideToast,
  };
}

