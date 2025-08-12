import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values with proper SA formatting
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'GBP', // FPL uses pounds
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get South African time-based greeting
 */
export function getSATimeGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good evening";
  }
}

/**
 * Get time-based CSS class for backgrounds
 */
export function getTimeBasedBg(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "morning-bg";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon-bg";
  } else {
    return "evening-bg";
  }
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get team color for styling
 */
export function getTeamColor(teamId: number): string {
  const teamColors: Record<number, string> = {
    1: '#EF0107', // Arsenal
    2: '#95BFE5', // Aston Villa
    3: '#DA020E', // Brentford
    4: '#6CABDD', // Brighton
    5: '#6C1D45', // Burnley
    6: '#034694', // Chelsea
    7: '#1B458F', // Crystal Palace
    8: '#003399', // Everton
    9: '#FFFFFF', // Fulham
    10: '#7A263A', // Liverpool
    11: '#6CABDD', // Manchester City
    12: '#DA020E', // Manchester United
    13: '#241F20', // Newcastle
    14: '#FDB913', // Norwich City
    15: '#D71920', // Southampton
    16: '#1F1F1F', // Tottenham
    17: '#FBEE23', // Watford
    18: '#7A263A', // West Ham
    19: '#FDB913', // Wolves
    20: '#003090', // Leicester City
  };
  
  return teamColors[teamId] || '#6B7280';
}

/**
 * Determine if a color is light or dark for text contrast
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
