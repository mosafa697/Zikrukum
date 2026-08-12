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
    bgColor: '#EFE7D5',
    buttonBgColor: '#FBF7ED',
    buttonBorderColor: '#DCCFAE',
    buttonHoverBgColor: '#E9DBB3',
    cardBgColor: '#FBF7ED',
    iconColor: '#435d51',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#EADFC5',
    secondaryTextColor: '#5B6B60',
    sliderBg: '#DCCFAE',
    sliderBgActive: '#2F5D50',
    textColor: '#23342C',
  },
  solarized: {
    bgColor: '#EFE7D5',
    buttonBgColor: '#FBF7ED',
    buttonBorderColor: '#DCCFAE',
    buttonHoverBgColor: '#E9DBB3',
    cardBgColor: '#FBF7ED',
    iconColor: '#23342C',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#EADFC5',
    secondaryTextColor: '#5B6B60',
    sliderBg: '#EADFC5',
    sliderBgActive: '#2F5D50',
    textColor: '#23342C',
  },
  dark: {
    bgColor: '#1E302C',
    buttonBgColor: '#264638',
    buttonBorderColor: '#3E5F53',
    buttonHoverBgColor: '#1C2B26',
    cardBgColor: '#233832',
    iconColor: '#E9DBB3',
    iconColorActive: '#ffffff',
    secondaryBgColor: '#2F5D50',
    secondaryTextColor: '#94A3B8',
    sliderBg: '#3E5F53',
    sliderBgActive: '#BB9A4F',
    textColor: '#F3ECD8',
  },
};

export function getAzkarTheme(name: string): AzkarTheme {
  return AZKAR_THEME_MAP[(name as AzkarThemeName) || 'solarized'] ?? AZKAR_THEME_MAP.solarized;
}

export const AZKAR_PRIMARY_FONT = Platform.select({
  ios: 'TajawalRegular',
  android: 'TajawalRegular',
  default: 'TajawalRegular',
});

export const AZKAR_TITLE_FONT = Platform.select({
  ios: 'TajawalBold',
  android: 'TajawalBold',
  default: 'TajawalBold',
});
