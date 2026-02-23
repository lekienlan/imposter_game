import { appSemanticColor, AppTheme } from './AppColor';

export interface AppColorScheme {
  surfacePrimary: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textBorder: string;
  textDisabled: string;
  primaryMain: string;
  primaryLight: string;
}

export const getAppColorScheme = (theme: AppTheme): AppColorScheme => {
  const tokens = appSemanticColor[theme];

  return {
    surfacePrimary: tokens.surfacePrimary,
    surfaceSecondary: tokens.surfaceSecondary,
    textPrimary: tokens.textPrimary,
    textSecondary: tokens.textSecondary,
    textTertiary: tokens.textTertiary,
    textBorder: tokens.textBorder,
    textDisabled: tokens.textDisabled,
    primaryMain: tokens.primaryMain,
    primaryLight: tokens.primaryLight,
  };
};
