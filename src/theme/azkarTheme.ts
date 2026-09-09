import { Platform } from 'react-native';

export type AzkarThemeName = 'light' | 'solarized' | 'dark';

export type AzkarTheme = {
  bgColor: string;
  bgGradient: [string, string];
  buttonBgColor: string;
  buttonBorderColor: string;
  buttonHoverBgColor: string;
  cardBgColor: string;
  cardShadowColor: string;
  cardShadowOpacity: number;
  cardShadowRadius: number;
  cardShadowOffset: { width: number; height: number };
  cardElevation: number;
  iconColor: string;
  iconColorActive: string;
  secondaryBgColor: string;
  secondaryTextColor: string;
  sliderBg: string;
  sliderBgActive: string;
  textColor: string;
  verseGradient: [string, string];
  verseTextColor: string;
  verseSubTextColor: string;
  accentGradient: [string, string];
  accentTextColor: string;
  tasbihGradient: [string, string, string];
  tasbihGlowColor: string;
  tasbihTextColor: string;
  tasbihShadowColor: string;
};

export const AZKAR_THEME_MAP: Record<AzkarThemeName, AzkarTheme> = {
  light: {
    bgColor: '#FAFAF8',
    bgGradient: ['#FAFAF8', '#F2F0EA'],
    buttonBgColor: '#FFFFFF',
    buttonBorderColor: '#E5E3DD',
    buttonHoverBgColor: '#F5F4EF',
    cardBgColor: '#FFFFFF',
    cardShadowColor: '#000000',
    cardShadowOpacity: 0.04,
    cardShadowRadius: 16,
    cardShadowOffset: { width: 0, height: 4 },
    cardElevation: 4,
    iconColor: '#1E4338',
    iconColorActive: '#FFFFFF',
    secondaryBgColor: '#F2F0EA',
    secondaryTextColor: '#6B7280',
    sliderBg: '#E5E3DD',
    sliderBgActive: '#1E4338',
    textColor: '#1F2937',
    verseGradient: ['#1E4338', '#16352D'],
    verseTextColor: '#FFFFFF',
    verseSubTextColor: '#DBEAFE',
    accentGradient: ['#BB9A4F', '#9A7D3D'],
    accentTextColor: '#d3d6db',
    tasbihGradient: ['#60A5FA', '#3B82F6', '#1D4ED8'],
    tasbihGlowColor: 'rgba(96, 165, 250, 0.42)',
    tasbihTextColor: '#FFFFFF',
    tasbihShadowColor: '#1D4ED8',
  },
  solarized: {
    bgColor: '#F7EFE2',
    bgGradient: ['#F7EFE2', '#F0E8DB'],
    buttonBgColor: '#FFFFFF',
    buttonBorderColor: '#E8E0D0',
    buttonHoverBgColor: '#F5EEDC',
    cardBgColor: '#FFFFFF',
    cardShadowColor: '#000000',
    cardShadowOpacity: 0.04,
    cardShadowRadius: 16,
    cardShadowOffset: { width: 0, height: 4 },
    cardElevation: 4,
    iconColor: '#BB9A4F',
    iconColorActive: '#FFFFFF',
    secondaryBgColor: '#EFE0CC',
    secondaryTextColor: '#766A56',
    sliderBg: '#E8E0D0',
    sliderBgActive: '#1E4338',
    textColor: '#3E352B',
    verseGradient: ['#1E4338', '#16352D'],
    verseTextColor: '#FFFFFF',
    verseSubTextColor: '#E9DBB3',
    accentGradient: ['#BB9A4F', '#9A7D3D'],
    accentTextColor: '#FFFFFF',
    tasbihGradient: ['#517D6D', '#426159', '#2D5046'],
    tasbihGlowColor: 'rgba(187, 154, 79, 0.4)',
    tasbihTextColor: '#F3ECD8',
    tasbihShadowColor: '#16352D',
  },
  dark: {
    bgColor: '#0B1120',
    bgGradient: ['#0B1120', '#02040A'],
    buttonBgColor: '#151E32',
    buttonBorderColor: '#27344D',
    buttonHoverBgColor: '#1E293B',
    cardBgColor: '#151E32',
    cardShadowColor: '#000000',
    cardShadowOpacity: 0.15,
    cardShadowRadius: 16,
    cardShadowOffset: { width: 0, height: 4 },
    cardElevation: 4,
    iconColor: '#93C5FD',
    iconColorActive: '#FFFFFF',
    secondaryBgColor: '#27344D',
    secondaryTextColor: '#94A3B8',
    sliderBg: '#27344D',
    sliderBgActive: '#3B82F6',
    textColor: '#E2E8F0',
    verseGradient: ['#1E3A8A', '#172554'],
    verseTextColor: '#E2E8F0',
    verseSubTextColor: '#93C5FD',
    accentGradient: ['#3B82F6', '#2563EB'],
    accentTextColor: '#FFFFFF',
    tasbihGradient: ['#60A5FA', '#3B82F6', '#1D4ED8'],
    tasbihGlowColor: 'rgba(59, 130, 246, 0.38)',
    tasbihTextColor: '#FFFFFF',
    tasbihShadowColor: '#172554',
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

export const AZKAR_TITLE_FONT = Platform.select({
  ios: 'ScheherazadeNew',
  android: 'ScheherazadeNew',
  default: 'ScheherazadeNew',
});

// ScheherazadeNew.ttf ships a single Regular (weight 400) face, so fontWeight
// requests have no bold face to resolve to. Use the loaded bold Arabic face
// (Tajawal-ExtraBold) for numeric counters to actually render bold.
export const AZKAR_COUNTER_FONT = Platform.select({
  ios: 'TajawalBold',
  android: 'TajawalBold',
  default: 'TajawalBold',
});
