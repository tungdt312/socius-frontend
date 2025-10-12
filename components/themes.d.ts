type ThemeColors=
    | 'blue'
    | 'green'
    | 'red'
    | 'yellow'
    | 'orange'
    | 'violet'
    | 'rose'
type ThemeModes = 'dark' | 'light' | 'system';
type Theme = {
    color: ThemeColors;
    mode: ThemeModes;
}
type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageThemeKey?: string;
    storageColorKey?: string;
}
type ThemeProviderState = {
    theme: Theme;
    setTheme: (newTheme: Theme) => void;
}