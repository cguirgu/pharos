/**
 * Inline emphasis for authored prose.
 *
 * The Faith course is written with light markdown-style emphasis — `*Theotokos*`
 * for a term being named, `**one nature out of two**` for a phrase worth
 * holding. React Native's `<Text>` renders those asterisks literally, so until
 * this component existed the app showed "say what makes it *apostolic*" with
 * the stars visible. Caught by looking at a screenshot of the running app.
 *
 * Deliberately tiny: `*single*` → italic, `**double**` → the semibold display
 * face. No links, no lists, no nesting — the content style guide does not use
 * them, and a fuller markdown renderer would be more surface than the job needs.
 */
import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { font } from './theme';

/** One run of text and how it should be set. */
interface Run {
  readonly text: string;
  readonly emphasis: 'none' | 'italic' | 'strong';
}

/**
 * Split on `**strong**` first, then `*italic*`, so the double form is never
 * mis-read as two singles. Unmatched markers are left alone rather than eaten,
 * so a stray asterisk in prose still renders as an asterisk.
 */
export function parseEmphasis(input: string): Run[] {
  const runs: Run[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    if (m.index > last) runs.push({ text: input.slice(last, m.index), emphasis: 'none' });
    if (m[1] !== undefined) runs.push({ text: m[1], emphasis: 'strong' });
    else if (m[2] !== undefined) runs.push({ text: m[2], emphasis: 'italic' });
    last = m.index + m[0].length;
  }
  if (last < input.length) runs.push({ text: input.slice(last), emphasis: 'none' });
  return runs.length > 0 ? runs : [{ text: input, emphasis: 'none' }];
}

/** True when the string contains emphasis this component would act on. */
export function hasEmphasis(input: string): boolean {
  return parseEmphasis(input).some((r) => r.emphasis !== 'none');
}

/**
 * Renders `children` with inline emphasis applied. Drop-in for a `<Text>` whose
 * content is authored prose — pass the same `style` you would have used.
 */
export function Emphasis({
  children,
  style,
  italicFamily = font.bodyItalic,
  strongFamily = font.bodyMed,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
  /** Override for contexts already set in an italic or display face. */
  italicFamily?: string;
  strongFamily?: string;
}) {
  const runs = parseEmphasis(children);
  return (
    <Text style={style}>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={
            run.emphasis === 'italic'
              ? { fontFamily: italicFamily }
              : run.emphasis === 'strong'
                ? { fontFamily: strongFamily }
                : undefined
          }
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}
