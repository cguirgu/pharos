/**
 * One question and its answers — the discussion itself.
 *
 * Affordances are typographic, per the design language (no emoji, no icons but
 * the lozenge):
 *   • affirming an answer is the `Mark` lozenge over a `Numeral` — the app's own
 *     "I keep this" gesture, pointed at someone's words instead of a practice;
 *   • the best answer is marked by its rule turning gold, plus a `Tag`;
 *   • reply / report / mark-best are caps words on a middot-separated line;
 *   • share is a caps word in the SheetBar's right slot.
 *
 * ⚠️ COLD START: a shared link opens this route directly, bypassing app/index.tsx
 * and its auth gate. So this screen must render while auth is still loading and
 * must not assume an account exists — a signed-out or guest reader can read.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Numeral, Tag, Mark, Btn } from '../../src/ui/components';
import { CitationCard } from '../../src/ui/CitationCard';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { sinceLabel } from '../../src/ui/format';
import { LIMITS } from '../../src/domain/limits';
import { keptFeedback, tapFeedback } from '../../src/platform/haptics';
import { shareQuestion } from '../../src/platform/shareQuestion';
import { useQuestions } from '../../src/state/questions';
import { useQuestionThread } from '../../src/state/questionThread';
import {
  authorLabel,
  canMarkBest,
  canReport,
  isOwnPost,
  type PostKind,
  type ThreadNode,
} from '../../src/domain/questions';

export default function QuestionThreadScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const load = useQuestionThread((s) => s.load);
  const clear = useQuestionThread((s) => s.clear);
  const loading = useQuestionThread((s) => s.loading);
  const buildThread = useQuestionThread((s) => s.thread);
  const post = useQuestionThread((s) => s.post);
  const markBest = useQuestionThread((s) => s.markBest);

  const accountId = useQuestions((s) => s.accountId);
  const isGuest = useQuestions((s) => s.isGuest);
  const toggleAffirm = useQuestions((s) => s.toggleAffirm);
  const hasAffirmed = useQuestions((s) => s.hasAffirmed);
  const report = useQuestions((s) => s.report);
  // Subscribing to the raw arrays is what re-renders this screen after a write.
  useQuestions((s) => s.answers);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const now = Date.now();

  useEffect(() => {
    if (id) void load(id);
    return () => clear();
  }, [id, load, clear]);

  const thread = buildThread('top');

  if (loading || !thread) {
    return (
      <Page>
        <SheetBar left={copy.questions.title} title={copy.questions.threadTitle} onBack={() => router.back()} />
        <Caps size={10} ls={1.4} color={t.ink3} style={{ marginTop: 20 }}>
          {loading ? '' : copy.questions.missing}
        </Caps>
      </Page>
    );
  }

  const q = thread.question;
  const mayAsk = !isGuest() && accountId !== null;

  const onShare = () => {
    void shareQuestion({ id: q.id, title: q.title });
  };

  const onReport = (targetType: PostKind, targetId: string) => {
    Alert.alert(copy.questions.reportTitle, copy.questions.reportBody, [
      { text: copy.questions.reportCancel, style: 'cancel' },
      {
        text: copy.questions.reportConfirm,
        style: 'destructive',
        onPress: () => void report(targetType, targetId, 'other'),
      },
    ]);
  };

  const onPost = async () => {
    if (!draft.trim()) return;
    if (!mayAsk) {
      router.push('/auth/welcome');
      return;
    }
    keptFeedback();
    await post({ body: draft, replyToAnswerId: replyTo });
    setDraft('');
    setReplyTo(null);
  };

  const answerBlock = (node: ThreadNode) => (
    <AnswerBlock
      key={node.answer.id}
      node={node}
      now={now}
      viewerAccountId={accountId}
      isBest={q.bestAnswerId === node.answer.id}
      canMark={canMarkBest(q, accountId)}
      affirmed={hasAffirmed('answer', node.answer.id)}
      onAffirm={() => {
        tapFeedback();
        void toggleAffirm('answer', node.answer.id);
      }}
      onBest={() => {
        keptFeedback();
        void markBest(node.answer.id);
      }}
      onReply={() => setReplyTo(node.answer.id)}
      onReport={() => onReport('answer', node.answer.id)}
    />
  );

  return (
    <Page>
      <SheetBar
        left={copy.questions.title}
        title={copy.questions.threadTitle}
        onBack={() => router.back()}
        right={
          <Pressable onPress={onShare} hitSlop={10}>
            <Caps size={9} ls={1.8} color={t.goldHi}>
              {copy.questions.share}
            </Caps>
          </Pressable>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text style={styles.qTitle}>{q.title}</Text>
          <View style={styles.byline}>
            <Caps size={8.5} ls={1.4} color={t.ink3}>
              {authorLabel(q.author, copy.questions.anonymous)} · {sinceLabel(q.createdAt, now)}
            </Caps>
            {canReport(q.author, accountId) ? (
              <Pressable onPress={() => onReport('question', q.id)} hitSlop={8}>
                <Caps size={8.5} ls={1.4} color={t.ink3}>
                  {copy.questions.report}
                </Caps>
              </Pressable>
            ) : null}
          </View>
          {q.moderation.status === 'hidden' && isOwnPost(q.author, accountId) ? (
            <Caps size={8.5} ls={1.4} color={t.rubricHi} style={{ marginTop: 8 }}>
              {copy.questions.underReview}
            </Caps>
          ) : null}
          {q.body ? <Text style={styles.qBody}>{q.body}</Text> : null}

          {q.citation ? <CitationCard citation={q.citation} /> : null}

          {thread.best ? (
            <>
              <Rubric num="Ⲁ">{copy.questions.best}</Rubric>
              {answerBlock(thread.best)}
            </>
          ) : null}

          <Rubric num="Ⲓ">{copy.questions.answers(thread.visibleCount)}</Rubric>
          {thread.answers.length === 0 && !thread.best ? (
            <Caps size={10} ls={1.4} color={t.ink3} style={{ marginTop: 8 }}>
              {copy.questions.noAnswers}
            </Caps>
          ) : (
            thread.answers.map(answerBlock)
          )}
        </ScrollView>

        <View style={styles.footer}>
          {replyTo ? (
            <Pressable onPress={() => setReplyTo(null)} hitSlop={8} style={{ paddingBottom: 6 }}>
              <Caps size={8.5} ls={1.4} color={t.gold}>
                {copy.questions.replyingTo} · {copy.questions.cancelReply}
              </Caps>
            </Pressable>
          ) : null}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={replyTo ? copy.questions.replyPlaceholder : copy.questions.answerPlaceholder}
            placeholderTextColor={t.ink3}
            multiline
            maxLength={LIMITS.answerBody}
            style={styles.input}
            selectionColor={t.gold}
          />
          <Btn kind="line" style={{ marginTop: 10 }} onPress={onPost} disabled={!draft.trim()}>
            {replyTo ? copy.questions.postReply : copy.questions.postAnswer}
          </Btn>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

function AnswerBlock({
  node,
  now,
  viewerAccountId,
  isBest,
  canMark,
  affirmed,
  onAffirm,
  onBest,
  onReply,
  onReport,
}: {
  node: ThreadNode;
  now: number;
  viewerAccountId: string | null;
  isBest: boolean;
  canMark: boolean;
  affirmed: boolean;
  onAffirm: () => void;
  onBest: () => void;
  onReply: () => void;
  onReport: () => void;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const a = node.answer;

  return (
    <View style={styles.answer}>
      {/* The lozenge as an affirmation: the app's "I keep this", pointed at
          someone's words. Not a thumb, not an arrow. */}
      <Pressable style={styles.gutter} onPress={onAffirm} hitSlop={8}>
        <Mark state={affirmed ? 'kept' : 'open'} size={16} />
        <Numeral size={20} color={affirmed ? t.goldHi : t.ink2}>
          {String(a.affirmations)}
        </Numeral>
        <Caps size={7} ls={1} color={t.ink3}>
          {affirmed ? copy.questions.affirmed : copy.questions.affirm}
        </Caps>
      </Pressable>

      <View style={[styles.answerBody, isBest && { borderLeftColor: t.gold }]}>
        {isBest ? (
          <View style={{ marginBottom: 6 }}>
            <Tag>{copy.questions.best}</Tag>
          </View>
        ) : null}
        <Text style={styles.aText}>{a.body}</Text>
        <Caps size={8} ls={1.2} color={t.ink3} style={{ marginTop: 6 }}>
          {authorLabel(a.author, copy.questions.anonymous)} · {sinceLabel(a.createdAt, now)}
        </Caps>
        {a.moderation.status === 'hidden' && isOwnPost(a.author, viewerAccountId) ? (
          <Caps size={8} ls={1.2} color={t.rubricHi} style={{ marginTop: 4 }}>
            {copy.questions.underReview}
          </Caps>
        ) : null}

        <View style={styles.actions}>
          <Pressable onPress={onReply} hitSlop={8}>
            <Caps size={8.5} ls={1.4} color={t.ink3}>
              {copy.questions.reply}
            </Caps>
          </Pressable>
          {canReport(a.author, viewerAccountId) ? (
            <>
              <Caps size={8.5} color={t.ink3}>
                ·
              </Caps>
              <Pressable onPress={onReport} hitSlop={8}>
                <Caps size={8.5} ls={1.4} color={t.ink3}>
                  {copy.questions.report}
                </Caps>
              </Pressable>
            </>
          ) : null}
          {canMark ? (
            <>
              <Caps size={8.5} color={t.ink3}>
                ·
              </Caps>
              <Pressable onPress={onBest} hitSlop={8}>
                <Caps size={8.5} ls={1.4} color={isBest ? t.gold : t.ink3}>
                  {isBest ? copy.questions.unmarkBest : copy.questions.markBest}
                </Caps>
              </Pressable>
            </>
          ) : null}
        </View>

        {node.replies.map((r) => (
          <View key={r.answer.id} style={styles.reply}>
            <Text style={styles.rText}>{r.answer.body}</Text>
            <Caps size={8} ls={1.2} color={t.ink3} style={{ marginTop: 4 }}>
              {authorLabel(r.answer.author, copy.questions.anonymous)} · {sinceLabel(r.answer.createdAt, now)}
            </Caps>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    qTitle: { fontFamily: font.display, fontSize: 30, color: t.parch, lineHeight: 34, marginTop: 4 },
    byline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    qBody: { fontFamily: font.body, fontSize: 17, color: t.parch, lineHeight: 26, marginTop: 14 },
    answer: { flexDirection: 'row', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
    gutter: { width: 44, alignItems: 'center', gap: 2 },
    answerBody: { flex: 1, borderLeftWidth: 1, borderLeftColor: t.ruleDim, paddingLeft: 14 },
    aText: { fontFamily: font.body, fontSize: 16, color: t.parch, lineHeight: 25 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    reply: { marginTop: 14, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: t.ruleDim },
    rText: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, lineHeight: 23 },
    footer: { paddingTop: 10, borderTopWidth: 1, borderTopColor: t.rule },
    input: {
      fontFamily: font.body,
      fontSize: 16,
      color: t.parch,
      lineHeight: 24,
      minHeight: 56,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: t.ruleDim,
      padding: 10,
    },
  });
