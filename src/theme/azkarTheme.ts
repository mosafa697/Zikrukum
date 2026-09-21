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
  // Switch (Settings toggles) ON-state colors, themed per palette:
  // solarized keeps the emerald look, light gets shiny light blue,
  // dark gets a dark blue — both matching each theme's accent family.
  switchTrackActive: string;
  switchThumbActive: string;
  // Dhikr progress-pill fill, tuned so the centered title (textColor) stays
  // legible on the fill — measured label-on-fill contrast: light 5.77,
  // solarized ~4.49, dark 5.44 (label-on-track is >= 9 in all themes).
  // Values are copied verbatim from existing palette tokens, not new colors.
  progressFill: string;
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
  // Flat audio player (sits directly on the white card): progress track/fill,
  // secondary button chips, and time/brown text tones.
  // Solarized values match the approved mock verbatim (dark green #1F4A3D,
  // cream #F3EBDD, sand #EADFC9, brown text #5C4E36 / #8A7B62); light/dark
  // derive from each palette's own accent family.
  playerTrack: string;
  playerFill: string;
  playerSecondaryBg: string;
  playerSecondaryBgActive: string;
  playerSecondaryText: string;
  playerText: string;
  playerTimeText: string;
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
    iconColor: '#3B82F6',
    iconColorActive: '#FFFFFF',
    secondaryBgColor: '#F2F0EA',
    secondaryTextColor: '#6B7280',
    sliderBg: '#E5E3DD',
    sliderBgActive: '#3B82F6',
    switchTrackActive: '#9BC6FC',
    switchThumbActive: '#3B82F6',
    progressFill: '#60A5FA',
    textColor: '#1F2937',
    verseGradient: ['#3B82F6', '#1D4ED8'],
    verseTextColor: '#FFFFFF',
    verseSubTextColor: '#DBEAFE',
    accentGradient: ['#9BC6FC', '#60A5FA'],
    accentTextColor: '#d3d6db',
    tasbihGradient: ['#60A5FA', '#3B82F6', '#1D4ED8'],
    tasbihGlowColor: 'rgba(96, 165, 250, 0.42)',
    tasbihTextColor: '#FFFFFF',
    tasbihShadowColor: '#1D4ED8',
    playerTrack: '#E5E3DD',
    playerFill: '#3B82F6',
    playerSecondaryBg: '#F2F0EA',
    playerSecondaryBgActive: '#E4E2D9',
    playerSecondaryText: '#4B5563',
    playerText: '#4B5563',
    playerTimeText: '#6B7280',
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
    switchTrackActive: '#1E4338',
    switchThumbActive: '#2F5D50',
    progressFill: '#BB9A4F',
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
    playerTrack: '#EADFC9',
    playerFill: '#1F4A3D',
    playerSecondaryBg: '#F3EBDD',
    playerSecondaryBgActive: '#E4D5BC',
    playerSecondaryText: '#5C4E36',
    playerText: '#5C4E36',
    playerTimeText: '#8A7B62',
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
    switchTrackActive: '#1E3A8A',
    switchThumbActive: '#2563EB',
    progressFill: '#1D4ED8',
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
    playerTrack: '#27344D',
    playerFill: '#3B82F6',
    playerSecondaryBg: '#1E293B',
    playerSecondaryBgActive: '#27344D',
    playerSecondaryText: '#94A3B8',
    playerText: '#94A3B8',
    playerTimeText: '#94A3B8',
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
