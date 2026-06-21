/**
 * Top-level error boundary. A render error anywhere below the boundary would
 * otherwise unmount the whole tree and leave a blank screen; here we catch it,
 * log it, and show a calm, on-brand fallback with a "try again" affordance that
 * re-mounts the children.
 *
 * Deliberately self-contained: it renders raw react-native primitives with
 * palette tokens read imperatively from the theme store (falling back to the
 * dark palette), so the fallback never itself depends on a hook/provider that
 * might be implicated in the very error it is catching.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { darkPalette, font, type Palette } from './theme';
import { useTheme } from '../state/theme';
import { copy } from './copy';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Surface to the JS console / crash logs; never rethrow.
    console.error('[error-boundary] caught render error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  override render() {
    if (!this.state.error) return this.props.children;

    // Read the current palette without subscribing (we're in an error path).
    let palette: Palette = darkPalette;
    try {
      palette = useTheme.getState().palette ?? darkPalette;
    } catch {
      palette = darkPalette;
    }
    const styles = makeStyles(palette);
    const c = copy.errorBoundary;

    return (
      <View style={styles.root}>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.body}>{c.body}</Text>
        <Pressable style={styles.btn} onPress={this.reset} hitSlop={10}>
          <Text style={styles.btnLabel}>{c.retry}</Text>
        </Pressable>
      </View>
    );
  }
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
    title: { fontFamily: font.display, fontSize: 30, color: t.parch, textAlign: 'center' },
    body: { fontFamily: font.body, fontSize: 16, color: t.ink2, lineHeight: 24, textAlign: 'center', marginTop: 12 },
    btn: { marginTop: 28, borderWidth: 1, borderColor: t.gold, paddingVertical: 12, paddingHorizontal: 28 },
    btnLabel: { fontFamily: font.caps, fontSize: 11, letterSpacing: 1.6, color: t.gold, textTransform: 'uppercase' },
  });
