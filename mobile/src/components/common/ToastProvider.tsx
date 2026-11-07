import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

type ToastTone = 'success' | 'error' | 'info';

interface ToastOptions {
  tone?: ToastTone;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: (_message: string, _options?: ToastOptions) => undefined,
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<ToastTone>('info');
  const animation = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const theme = useAppTheme();

  const show = useCallback(
    (nextMessage: string, options?: ToastOptions) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setMessage(nextMessage);
      setTone(options?.tone ?? 'info');
      setVisible(true);
      animation.stopAnimation();
      animation.setValue(0);

      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setVisible(false);
          }
        });
      }, 2200);
    },
    [animation],
  );

  const value = useMemo(() => ({ show }), [show]);

  const toneStyles =
    tone === 'success'
      ? { backgroundColor: theme.mode === 'dark' ? '#113829' : '#E9F9EF', accentColor: theme.colors.success, textColor: theme.mode === 'dark' ? '#E9FFF3' : '#0F2E1D', icon: 'checkmark-circle' as const }
      : tone === 'error'
        ? { backgroundColor: theme.mode === 'dark' ? '#3A1820' : '#FDECEC', accentColor: theme.colors.danger, textColor: theme.mode === 'dark' ? '#FFECEC' : '#3D1418', icon: 'alert-circle' as const }
        : { backgroundColor: theme.mode === 'dark' ? '#12283B' : '#EAF4FF', accentColor: theme.colors.primary, textColor: theme.mode === 'dark' ? '#ECF7FF' : '#10263D', icon: 'information-circle' as const };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible ? (
        <Animated.View
          style={[
            styles.toast,
            theme.shadows.floating,
            {
              backgroundColor: toneStyles.backgroundColor,
              borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border,
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: toneStyles.accentColor }]}>
            <Ionicons name={toneStyles.icon} size={18} color="#FFFFFF" />
          </View>
          <Text style={[theme.typography.bodyStrong, { color: toneStyles.textColor, flex: 1 }]}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
