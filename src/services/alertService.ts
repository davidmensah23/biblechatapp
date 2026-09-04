import { Alert } from 'react-native';

export interface AlertButtonConfig {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: string;
}

export interface AlertPayload {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButtonConfig[];
  options?: { cancelable?: boolean; onDismiss?: () => void };
  icon?: string;
}

type AlertListener = (payload: AlertPayload) => void;

let listener: AlertListener | null = null;
const originalAlert = Alert.alert;

export const setGlobalAlertListener = (l: AlertListener | null) => {
  listener = l;
};

export const showCustomAlert = (
  title: string,
  message?: string,
  buttons?: AlertButtonConfig[],
  options?: { cancelable?: boolean; onDismiss?: () => void },
  icon?: string
) => {
  const normalizedButtons: AlertButtonConfig[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default' }];

  if (listener) {
    listener({
      visible: true,
      title: title || '',
      message: message || '',
      buttons: normalizedButtons,
      options,
      icon
    });
  } else {
    originalAlert(title, message, buttons, options);
  }
};

export const dismissGlobalAlert = () => {
  if (listener) {
    listener({
      visible: false,
      title: '',
      message: '',
      buttons: []
    });
  }
};

/**
 * Installs a transparent interceptor on React Native's Alert.alert so that
 * all Alert.alert() calls across the app automatically render our beautiful
 * custom popup modal instead of the native OS dialog.
 */
let isInterceptorInstalled = false;
export const installAlertInterceptor = () => {
  if (isInterceptorInstalled) return;
  isInterceptorInstalled = true;

  Alert.alert = (title: string, message?: string, buttons?: any[], options?: any) => {
    showCustomAlert(title, message, buttons, options);
  };
};
