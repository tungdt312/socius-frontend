"use client"
import {Moon, Sun} from 'lucide-react';

import {useTheme} from './ThemeProvider';
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React, {useEffect, useState} from "react";
import {Toggle} from "@/components/ui/toggle";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Skeleton} from "@/components/ui/skeleton";

export default function ThemeModeToggle() {
    const {setTheme, theme} = useTheme();
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
const colorPairs: Record<string, [string, string]> = {
    blue: ['#1447E6FF', '#1447E6AA'],
    green: ['#5EA500FF', '#5EA500AA'],
    red: ['#E7000BFF', '#FB2C36FF'],
    rose: ['#EC003FFF', '#FF2056FF'],
    orange: ['#F54900FF', '#FF6900FF'],
    yellow: ['#FDC700FF', '#F0B100FF'],
    violet: ['#7F22FEFF', '#8E51FFFF'],
}

export const ThemeForm = () => {
    const {theme, setTheme} = useTheme(); // Giả sử bạn dùng lại phiên bản "controlled"
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <FieldGroup>
                <FieldSet>
                    <Field orientation={"responsive"}>
                        <FieldLabel>Chế độ sáng</FieldLabel>
                        <Skeleton
                            className="h-10 w-full rounded-md border border-input bg-background"/> {/* Skeleton cho Select */}
                    </Field>
                    <Field orientation={"responsive"}>
                        <FieldLabel>Chủ đề</FieldLabel>
                        <Skeleton className="h-12 w-full flex justify-around items-center"/> {/* Skeleton cho Radio */}
                    </Field>
                </FieldSet>
            </FieldGroup>
        );
    }


    return (
        <FieldGroup>
            <FieldSet>
                <Field orientation={"responsive"}>
                    <FieldLabel>
                        Chế độ sáng
                    </FieldLabel>
                    <Select
                        value={theme.mode}
                        onValueChange={(t) => {
                            setTheme({mode: t as ThemeModes, color: theme.color});
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={"Chọn chế độ"}/>
                        </SelectTrigger>
                        <SelectContent className={"flex flex-col w-full"}>
                            <SelectItem value={"system"} aria-label={"Hệ thống"} key={"system"}
                                        className="w-full gap-2">Hệ thống</SelectItem>
                            <SelectItem value={"light"} aria-label={"Sáng"} key={"light"}
                                        className="w-full gap-2">Sáng</SelectItem>
                            <SelectItem value={"dark"} aria-label={"Tối"} key={"dark"}
                                        className="w-full gap-2">Tối</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field orientation={"responsive"}>
                    <FieldLabel>
                        Chủ đề
                    </FieldLabel>
                    <RadioGroup
                        className={"w-fit p-1 flex justify-around items-center mx-auto"}
                        value={theme.color}
                        onValueChange={(c) => {
                            setTheme({mode: theme.mode, color: c as ThemeColors});
                        }}
                    >
                        {Object.entries(colorPairs).map(([key, [left, right]]) => (
                            <div key={key} className="relative">
                                <RadioGroupItem
                                    value={key}
                                    id={`color-${key}`}
                                    className="sr-only"
                                />
                                <Label
                                    htmlFor={`color-${key}`}
                                    title={key}
                                    className="cursor-pointer"
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: `linear-gradient( ${left} 50%, ${right} 50%)`,
                                        }}
                                        // 6. So sánh với 'theme.color' toàn cục
                                        className={`flex items-center justify-center ${
                                            theme.color === key ? 'ring-2 ring-ring' : ''
                                        }`}
                                    >
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </Field>
            </FieldSet>
        </FieldGroup>
    );
}