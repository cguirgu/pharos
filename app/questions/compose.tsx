/**
 * Ask a question. Opened from the Questions feed, or from a passage via the
 * selection tooltip's "Ask others" — in which case the citation arrives as the
 * `cite` param and is shown, unremarked, at the top: it came with you.
 *
 * Section structure follows app/practice/compose.tsx (a display-font title, then
 * Rubric-gated sections), and the header follows app/journal/[id].tsx.
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Chip, Toggle, Btn, Register } from '../../src/ui/components';
import { CitationCard } from '../../src/ui/CitationCard';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { LIMITS } from '../../src/domain/limits';
import { decodeCitation } from '../../src/domain/citation';
import { MAX_TOPICS, QUESTION_TOPICS, validateQuestionDraft, type QuestionTopic } from '../../src/domain/questions';
import { useQuestions } from '../../src/state/questions';

export default function AskScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const { cite } = useLocalSearchParams<{ cite?: string }>();

  // Read the citation ONCE. A later param change must never wipe an edit in
  // progress, and decodeCitation never throws — a malformed param simply means
  // an uncited question rather than a broken screen.
  const initialCitation = useMemo(() => decodeCitation(cite), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [citation, setCitation] = useState(initialCitation);

  const ask = useQuestions((s) => s.ask);
  const displayName = useQuestions((s) => s.displayName);
  const anonymousDefault = useQuestions((s) => s.anonymousDefault);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topics, setTopics] = useState<QuestionTopic[]>([]);
  const [anonymous, setAnonymous] = useState(anonymousDefault);

  const issues = validateQuestionDraft({ title, body, topics, citation, anonymous });
  const ready = issues.length === 0;

  const toggleTopic = (topic: QuestionTopic) => {
    setTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((x) => x !== topic)
        : prev.length >= MAX_TOPICS
          ? prev
          : [...prev, topic],
    );
  };

  const onPost = async () => {
    if (!ready) return;
    const newId = await ask({ title, body, topics, citation, anonymous });
    if (!newId) return;
    // replace, not push: Back returns to the feed rather than the composer.
    router.replace(`/questions/${newId}`);
  };

  return (
    <Page>
      <SheetBar
        left={copy.questions.cancel}
        title={citation ? copy.questions.composeCitedTitle : copy.questions.composeTitle}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy.questions.titlePlaceholder}
            placeholderTextColor={t.ink3}
            maxLength={LIMITS.questionTitle}
            multiline
            style={styles.titleInput}
            selectionColor={t.gold}
          />

          {citation ? (
            <>
              <CitationCard citation={citation} />
              <Pressable onPress={() => setCitation(null)} hitSlop={8} style={{ paddingVertical: 10 }}>
                <Caps size={8.5} ls={1.4} color={t.ink3}>
                  {copy.questions.removeCitation}
                </Caps>
              </Pressable>
            </>
          ) : null}

          <Rubric num="ⲓ">{copy.questions.bodySection}</Rubric>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={copy.questions.bodyPlaceholder}
            placeholderTextColor={t.ink3}
            multiline
            maxLength={LIMITS.questionBody}
            style={styles.bodyInput}
            selectionColor={t.gold}
          />

          <Rubric num="ⲓⲓ">{copy.questions.topicsSection}</Rubric>
          <View style={styles.chips}>
            {QUESTION_TOPICS.map((topic) => (
              <Chip key={topic} on={topics.includes(topic)} onPress={() => toggleTopic(topic)}>
                {copy.questions.topics[topic]}
              </Chip>
            ))}
          </View>

          <Rubric num="ⲓⲓⲓ">{copy.questions.appearance}</Rubric>
          <Register onTop>
            <Text style={styles.rowLabel}>{copy.questions.askAnonymously}</Text>
            <Toggle value={anonymous} onChange={setAnonymous} />
          </Register>
          <Caps size={8.5} ls={1.4} color={t.ink3} style={{ marginTop: 10, lineHeight: 16 }}>
            {anonymous ? copy.questions.postingAnonymously : copy.questions.postingAs(displayName ?? 'your name')}
          </Caps>

          <View style={{ height: 26 }} />
          <Btn kind="solid" onPress={onPost} disabled={!ready}>
            {copy.questions.post}
          </Btn>
          {issues.includes('title-too-short') && title.trim().length > 0 ? (
            <Caps size={8.5} ls={1.4} color={t.ink3} style={{ marginTop: 10 }}>
              {copy.questions.tooShort}
            </Caps>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    titleInput: {
      fontFamily: font.display,
      fontSize: 30,
      color: t.parch,
      lineHeight: 36,
      paddingVertical: 8,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: t.ruleDim,
    },
    bodyInput: {
      fontFamily: font.body,
      fontSize: 17,
      color: t.parch,
      lineHeight: 26,
      paddingTop: 8,
      minHeight: 140,
      textAlignVertical: 'top',
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    rowLabel: { flex: 1, fontFamily: font.display, fontSize: 19, color: t.parch },
  });
