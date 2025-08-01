import { View, type ViewProps } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colors = useThemeColors();
  const backgroundColor = lightColor || darkColor || colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
