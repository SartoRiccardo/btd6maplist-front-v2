export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    active: string;
    contrast: string;
    text: string;
    textMuted: string;
    danger: string;
    textActive: string;
    fontBorder: string;
    fontBorderActive: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'deep-ocean',
    name: 'Cool epic',
    colors: {
      primary: '#0d1b2a',
      secondary: '#1b3a5c',
      highlight: '#ff8c42',
      active: '#fec6a3',
      contrast: '#4a7fa5',
      text: '#e8f1f8',
      textMuted: '#a8b8c8',
      danger: '#e05c5c',
      textActive: '#ffffff',
      fontBorder: '#000000',
      fontBorderActive: '#000000',
    },
  },
  {
    id: 'legacy',
    name: 'Oldhead Charm',
    colors: {
      primary: '#202c39',
      secondary: '#34495b',
      highlight: '#f29559',
      active: '#f2d492',
      contrast: '#7190ad',
      text: '#ffffff',
      textMuted: '#b0bec5',
      danger: '#e05c5c',
      textActive: '#ffffff',
      fontBorder: '#000000',
      fontBorderActive: '#000000',
    },
  },
  {
    id: 'shimmer',
    name: 'Ourple!!!',
    colors: {
      primary: '#1a0a2e',
      secondary: '#3b1f6e',
      highlight: '#e040fb',
      active: '#f3a0ff',
      contrast: '#7c4dff',
      text: '#f0e6ff',
      textMuted: '#b8a0d0',
      danger: '#ff5252',
      textActive: '#ffffff',
      fontBorder: '#000000',
      fontBorderActive: '#000000',
    },
  },
  {
    id: 'arctic',
    name: 'Open at 3AM',
    colors: {
      primary: '#e8f0f8',
      secondary: '#ccdce8',
      highlight: '#1a6cb0',
      active: '#104080',
      contrast: '#5090c0',
      text: '#1a2a3a',
      textMuted: '#5a6a7a',
      danger: '#d03030',
      textActive: '#ffffff',
      fontBorder: '#ffffff',
      fontBorderActive: '#000000',
    },
  },
  {
    id: 'abysmal',
    name: 'Abysmal Eye Violence',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ff00',
      highlight: '#ff0000',
      active: '#ffff00',
      contrast: '#0000ff',
      text: '#00ffff',
      textMuted: '#ff6600',
      danger: '#39ff14',
      textActive: '#ff00ff',
      fontBorder: '#ffff00',
      fontBorderActive: '#00ff00',
    },
  },
];

export const DEFAULT_THEME_ID = 'deep-ocean';
