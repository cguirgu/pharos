/**
 * Tiny responsive helper — scales type/art and bounds centred text so screens
 * read well from an iPhone SE (~320pt) up to tablets. Reference width ≈ 390pt
 * (iPhone 13/14); the factor is clamped so nothing gets silly at the extremes.
 */
import { useWindowDimensions } from 'react-native';

export interface Responsive {
  readonly width: number;
  readonly height: number;
  /** Narrow phones (≤ ~360pt) — tighten where needed. */
  readonly small: boolean;
  /** Scale a base size for this screen (≈0.82×–1.15×). */
  readonly scale: (n: number) => number;
  /** A comfortable max width for centred text/content. */
  readonly textWidth: number;
}

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const factor = Math.max(0.82, Math.min(1.15, width / 390));
  return {
    width,
    height,
    small: width <= 360,
    scale: (n) => Math.round(n * factor),
    textWidth: Math.min(360, width - 56),
  };
}
