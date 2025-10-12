"use client"
import { Moon, Sun } from 'lucide-react';

import { useTheme } from './ThemeProvider';
import {Button} from "@/components/ui/button";

export default function ThemeModeToggle() {
    const { setTheme, theme } = useTheme();
    return (
        <Button
            variant="default"
            size="icon"
            className="titlebar-button rounded-full bg-primary focus-visible:ring-0 hover:bg-primary/80
        border-0 hover:brightness-150 hover:shadow-none hover:border-0 duration-500 text-primary-foreground
        ease-in-out transition-all"
            onClick={() => {
                const colors = [
                    'rose',
                    'blue',
                    'green',
                    'orange',
                    'red',
                    'yellow',
                    'violet'
                ];
                const randomColor = colors[
                    Math.floor(Math.random() * colors.length)
                    ] as ThemeColors;
                setTheme({
                    mode: theme.mode === 'light' ? 'dark' : 'light',
                    color: randomColor
                });
            }}
        >
            <Sun
                className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all t
          dark:-rotate-90 dark:scale-0"
            />
            <Moon
                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0
          dark:scale-100 "
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}