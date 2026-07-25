import { Platform } from 'react-native';

export type AzkarThemeName = 'light' | 'solarized' | 'dark';

export type AzkarTheme = {
  bgColor: string;
  buttonBgColor: string;
  buttonBorderColor: string;
  buttonHoverBgColor: string;
  cardBgColor: string;
  iconColor: string;
  iconColorActive: string;
  secondaryBgColor: string;
  secondaryTextColor: string;
  sliderBg: string;
  sliderBgActive: string;
  textColor: string;
};

export const AZKAR_THEME_MAP: Record<AzkarThemeName, AzkarTheme> = {
  light: {
    bgColor: '#fefefe',
    buttonBgColor: '#f9fafb',
    buttonBorderColor: '#e5e7eb',
    buttonHoverBgColor: '#f3f4f6',
    cardBgColor: '#ffffff',
    iconColor: '#575b63',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#f9fafb',
    secondaryTextColor: '#6b7280',
    sliderBg: '#f0f0f0',
    sliderBgActive: '#3b82f6',
    textColor: '#111827',
  },
  solarized: {
    bgColor: '#f8ede0',
    buttonBgColor: '#f8ede0',
    buttonBorderColor: '#93a1a1',
    buttonHoverBgColor: '#d3d3d3',
    cardBgColor: '#fff9f4',
    iconColor: '#00753a',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#f8ede0',
    secondaryTextColor: '#657b83',
    sliderBg: '#f8ede0',
    sliderBgActive: '#00753a',
    textColor: '#363739',
  },
  dark: {
    bgColor: '#1e293b',
    buttonBgColor: '#475569',
    buttonBorderColor: '#64748b',
    buttonHoverBgColor: '#1e293b',
    cardBgColor: '#334155',
    iconColor: '#dcebff',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#475569',
    secondaryTextColor: '#94a3b8',
    sliderBg: '#64748b',
    sliderBgActive: '#2563eb',
    textColor: '#f8fafc',
  },
};

export function getAzkarTheme(name: string): AzkarTheme {
  return AZKAR_THEME_MAP[(name as AzkarThemeName) || 'solarized'] ?? AZKAR_THEME_MAP.solarized;
}

export const AZKAR_PRIMARY_FONT = Platform.select({
  ios: 'ScheherazadeNew',
  android: 'ScheherazadeNew',
  default: 'ScheherazadeNew',
});
