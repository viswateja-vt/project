import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined
  );

const THEME_KEY = 'qr-studio-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
  ) {
    return 'dark';
  }

  return 'light';
}

function resolveTheme(
  theme: Theme
): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }

  return theme;
}

function getSavedTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const saved =
    localStorage.getItem(THEME_KEY);

  if (
    saved === 'light' ||
    saved === 'dark' ||
    saved === 'system'
  ) {
    return saved;
  }

  return 'system';
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>(getSavedTheme);

  const [resolvedTheme, setResolvedTheme] =
    useState<'light' | 'dark'>(() =>
      resolveTheme(theme)
    );

  useEffect(() => {
    const resolved =
      resolveTheme(theme);

    setResolvedTheme(resolved);

    document.documentElement.classList.toggle(
      'dark',
      resolved === 'dark'
    );

    document.documentElement.style.colorScheme =
      resolved;
      
    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const media =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

    const handleChange = (
      event: MediaQueryListEvent
    ) => {
      setResolvedTheme(
        event.matches ? 'dark' : 'light'
      );
    };

    media.addEventListener(
      'change',
      handleChange
    );

    return () => {
      media.removeEventListener(
        'change',
        handleChange
      );
    };
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
  }

  function toggleTheme() {
    setThemeState((current) => {
      const currentResolved =
        resolveTheme(current);

      return currentResolved === 'dark'
        ? 'light'
        : 'dark';
    });
  }

  const value =
    useMemo<ThemeContextValue>(
      () => ({
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }),
      [theme, resolvedTheme]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within ThemeProvider'
    );
  }

  return context;
}