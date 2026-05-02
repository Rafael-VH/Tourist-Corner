export const theme = {
  colors: {
    // Warm palette for light mode
    primary: {
      50: '#FFF8F1',
      100: '#FFECD4',
      200: '#FFD5A8',
      300: '#FFB84D',
      400: '#FF9F1C',
      500: '#E8850C',
      600: '#C46A08',
      700: '#9C4F06',
      800: '#7B3E08',
      900: '#5C2E08',
    },
    // Warm secondary (terracotta/coral)
    secondary: {
      50: '#FFF5F2',
      100: '#FFE8E0',
      200: '#FFCFC0',
      300: '#FFA88C',
      400: '#FF7A52',
      500: '#E85D35',
      600: '#C44624',
      700: '#9C341C',
      800: '#7B2918',
      900: '#5C1F12',
    },
    // Warm neutrals
    warm: {
      50: '#FDF8F3',
      100: '#F5EDE3',
      200: '#E8D9C8',
      300: '#D4BEA5',
      400: '#B89A7A',
      500: '#96785A',
      600: '#7A5F45',
      700: '#5E4836',
      800: '#4A3829',
      900: '#362820',
    },
    // Dark mode palette
    dark: {
      bg: '#0F1419',
      surface: '#1A2028',
      surfaceHighlight: '#242B35',
      border: '#2D3748',
      text: '#E2E8F0',
      textMuted: '#94A3B8',
      textFaint: '#64748B',
      accent: '#FF9F1C',
      accentHover: '#FFB84D',
      secondary: '#FF7A52',
      danger: '#EF4444',
      success: '#22C55E',
    },
    // Light mode surface
    light: {
      bg: '#FDF8F3',
      surface: '#FFFFFF',
      surfaceHighlight: '#FFF8F1',
      border: '#E8D9C8',
      text: '#2D1F14',
      textMuted: '#5E4836',
      textFaint: '#96785A',
      accent: '#E8850C',
      accentHover: '#C46A08',
      secondary: '#E85D35',
      danger: '#DC2626',
      success: '#16A34A',
    },
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    warm: '0 4px 20px -2px rgba(232, 133, 12, 0.15)',
    warmLg: '0 8px 30px -4px rgba(232, 133, 12, 0.2)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
} as const;

export type Theme = typeof theme;
