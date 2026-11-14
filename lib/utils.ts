import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "250g" -> "250g pack"; values that already say pack ("100g Pack") -> "100g pack". */
export function packSizeLabel(weight: string) {
  const trimmed = weight.trim();
  return /\bpack\b/i.test(trimmed) ? trimmed.replace(/\bpack\b/i, "pack") : `${trimmed} pack`;
}
