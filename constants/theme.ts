/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#002D62';
const tintColorDark = '#D4AF37';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#000000', // Black for icons/accents
    icon: '#000000', // Black for icons
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#000000',
    surface: '#FFFFFF',
    border: '#E0E0E0',
    primary: '#000000',
    secondary: '#757575',
    success: '#000000', // Success as black
    error: '#000000', // Error as black (or maybe dark grey if needed for distinction, but user said strict)
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF', // White for dark mode
    icon: '#FFFFFF',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#FFFFFF',
    surface: '#121212',
    border: '#424242',
    primary: '#FFFFFF',
    secondary: '#BDBDBD',
    success: '#FFFFFF',
    error: '#FFFFFF',
  },
};

export type ThemeType = 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
