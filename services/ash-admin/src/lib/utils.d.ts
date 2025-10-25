import { type ClassValue } from "clsx";
/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplicates conflicting classes
 */
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Re-export all utility functions from utils/ folder
 * This allows importing from '@/lib/utils' instead of '@/lib/utils/styling'
 */
export * from './utils';
