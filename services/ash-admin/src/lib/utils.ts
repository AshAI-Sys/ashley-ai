import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplicates conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Re-export all utility functions from utils/ folder
 * This allows importing from '@/lib/utils' instead of '@/lib/utils/styling'
 */
export * from './utils';
