import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {postAccess} from "@/constants/enum";
import {Globe, Lock, Users} from "lucide-react";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const parseStringify =  (input: unknown) => {
  return JSON.parse(JSON.stringify(input))
}

export function formatISODate(isoString: string) {
  const date = new Date(isoString);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export const formatNumber = (num: number) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num;
};



export const BASE = process.env.NEXT_PUBLIC_BASE_URL