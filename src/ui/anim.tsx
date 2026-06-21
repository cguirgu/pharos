/**
 * Small, intentional motion helpers built on the React Native `Animated` API
 * (no new deps — the codebase's restrained "codex" style). Used by onboarding:
 *  - SlideFade: an enter transition for each step (slides + fades in, direction
 *    aware so forward comes from the right, back from the left).
 *  - Stagger: reveals its children in sequence (fade + rise), a few ms apart.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

/** Enter transition: translateX (dir·distance → 0) + opacity (0 → 1). */
export function SlideFade({
  children,
  dir = 1,
  distance = 28,
  duration = 280,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  /** 1 = incoming from the right (forward); -1 = from the left (back). */
  dir?: 1 | -1;
  distance?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useRef(new Animated.Value(0)).current; // 0 → 1
  useEffect(() => {
    p.setValue(0);
    Animated.timing(p, { toValue: 1, duration, delay, useNativeDriver: true }).start();
  }, [p, duration, delay]);
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [dir * distance, 0] });
  return (
    <Animated.View style={[style, { opacity: p, transform: [{ translateX }] }]}>{children}</Animated.View>
  );
}

/** Fade + rise a single item into place, after `index · step` ms. */
export function StaggerItem({
  children,
  index = 0,
  step = 40,
  rise = 8,
  duration = 260,
  style,
}: {
  children: React.ReactNode;
  index?: number;
  step?: number;
  rise?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration, delay: index * step, useNativeDriver: true }).start();
  }, [p, index, step, duration]);
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] });
  return <Animated.View style={[style, { opacity: p, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Wrap a list of children to reveal them one after another. */
export function Stagger({
  children,
  step = 40,
  base = 0,
}: {
  children: React.ReactNode;
  step?: number;
  base?: number;
}) {
  return (
    <>
      {React.Children.toArray(children).map((child, i) => (
        <StaggerItem key={i} index={base + i} step={step}>
          {child}
        </StaggerItem>
      ))}
    </>
  );
}
