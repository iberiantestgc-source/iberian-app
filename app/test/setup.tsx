import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { generateTest } from '../../src/api/tests';
import { api } from '../../src/api/client';
import {
  TOPICS,
  type Topic,
  type Subtopic,
  type Article,
} from '../../src/constants/topics';
import { useThemeStore } from '../../src/context/themeStore';
import { getMySubscription } from '../../src/api/subscriptions';

type Mode = 'general' | 'topics' | 'real';

const COUNTS = [10, 25, 50, 75, 100] as const;

function getTimeLimitSec(count: number) {
  return Math.round(count * 86.4);
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

type SelectionState = 'none' | 'partial' | 'full';

function getSubtopicSelectionState(
  sub: Subtopic,
  selectedArticles: Set<string>,
  selectedSubtopics: Set<string>,
): SelectionState {
  if (!sub.articles?.length) {
    return selectedSubtopics.has(sub.id) ? 'full' : 'none';
  }
  const total = sub.articles.length;
  let selected = 0;
  for (const art of sub.articles) {
    if (selectedArticles.has(art.id)) selected += 1;
  }
  if (selected === 0) return 'none';
  if (selected === total) return 'full';
  return 'partial';
}

function getTopicSelectionState(
  topic: Topic,
  selectedSubtopics: Set<string>,
  selectedArticles: Set<string>,
): SelectionState {
  if (!topic.subtopics?.length) {
    return selectedSubtopics.has(topic.id) ? 'full' : 'none';
  }
  let full = 0;
  let partial = 0;
  for (const sub of topic.subtopics) {
    const state = getSubtopicSelectionState(
      sub,
      selectedArticles,
      selectedSubtopics,
    );
    if (state === 'full') full += 1;
    else if (state === 'partial') partial += 1;
  }
  if (full === topic.subtopics.length) return 'full';
  if (full > 0 || partial > 0) return 'partial';
  return 'none';
}

export default function TestSetupScreen() {
  const { colors } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  const params = useLocalSearchParams<{
    mode?: string;
    topicId?: string;
    subtopicId?: string;
  }>();

  const initialMode: Mode =
    params.mode === 'real'
      ? 'real'
      : params.mode === 'general'
        ? 'general'
        : 'topics';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [count, setCount] = useState<number>(initialMode === 'real' ? 100 : 10);

  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(
    new Set(),
  );
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [expandedSubtopics, setExpandedSubtopics] = useState<string[]>([]);

  const [oppositionId, setOppositionId] = useState<string | null>(null);
  const [loadingOpp, setLoadingOpp] = useState(true);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number>(10);
  const [plan, setPlan] = useState<string>('FREE');

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'real') setCount(100);
  }, [initialMode]);

  useEffect(() => {
    if (params.topicId) {
      const topic = TOPICS.find((t) => t.id === String(params.topicId));
      if (topic) {
        const nextSubs = new Set<string>();
        const nextArts = new Set<string>();
        topic.subtopics?.forEach((s) => {
          nextSubs.add(s.id);
          s.articles?.forEach((a) => nextArts.add(a.id));
        });
        setSelectedSubtopics(nextSubs);
        setSelectedArticles(nextArts);
        setExpandedTopics((prev) =>
          prev.includes(topic.id) ? prev : [...prev, topic.id],
        );
      }
    }
    if (params.subtopicId) {
      setSelectedSubtopics((prev) => {
        const next = new Set(prev);
        next.add(String(params.subtopicId));
        return next;
      });
    }
  }, [params.topicId, params.subtopicId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/oppositions');
        const list = Array.isArray(data) ? data : data?.items || [];
        const gc =
          list.find(
            (o: any) => o.code === 'GC' || /guardia/i.test(o.name || ''),
          ) || list[0];
        setOppositionId(gc?.id || null);
        if (!gc?.id) {
          setErrorMsg(
            'No hay oposición en el servidor. Ejecuta el seed del backend.',
          );
        }
      } catch {
        setOppositionId(null);
        setErrorMsg(
          'No se pudo conectar con el backend. ¿Está en marcha el servidor?',
        );
      } finally {
        setLoadingOpp(false);
      }
    })();

    getMySubscription()
      .then((d) => {
        const p = d.limits?.plan || d.subscription?.plan || 'FREE';
        setPlan(p);
        const limit =
          p === 'PREMIUM' || p === 'Premium'
            ? d.limits?.dailyQuestions ?? 10000
            : d.limits?.dailyQuestions ?? 10;
        setDailyLimit(limit);
      })
      .catch(() => {
        setDailyLimit(10);
        setPlan('FREE');
      });
  }, []);

  // ---------- Selección en cascada ----------

  const toggleTopic = (topic: Topic) => {
    const state = getTopicSelectionState(
      topic,
      selectedSubtopics,
      selectedArticles,
    );
    setSelectedSubtopics((prev) => {
      const next = new Set(prev);
      if (state === 'full') {
        topic.subtopics?.forEach((s) => next.delete(s.id));
      } else {
        topic.subtopics?.forEach((s) => next.add(s.id));
      }
      return next;
    });
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (state === 'full') {
        topic.subtopics?.forEach((s) =>
          s.articles?.forEach((a) => next.delete(a.id)),
        );
      } else {
        topic.subtopics?.forEach((s) =>
          s.articles?.forEach((a) => next.add(a.id)),
        );
      }
      return next;
    });
  };

  const toggleSubtopic = (sub: Subtopic) => {
    const state = getSubtopicSelectionState(
      sub,
      selectedArticles,
      selectedSubtopics,
    );
    setSelectedSubtopics((prev) => {
      const next = new Set(prev);
      if (state === 'full') next.delete(sub.id);
      else next.add(sub.id);
      return next;
    });
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (state === 'full') {
        sub.articles?.forEach((a) => next.delete(a.id));
      } else {
        sub.articles?.forEach((a) => next.add(a.id));
      }
      return next;
    });
  };

  const toggleArticle = (article: Article, parentSub: Subtopic) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(article.id)) next.delete(article.id);
      else next.add(article.id);
      return next;
    });
    // Si marcamos un artículo, aseguramos que el subtema conste como seleccionado
    setSelectedSubtopics((prev) => {
      const next = new Set(prev);
      next.add(parentSub.id);
      return next;
    });
  };

  const toggleExpandedTopic = (id: string) => {
    setExpandedTopics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleExpandedSubtopic = (id: string) => {
    setExpandedSubtopics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedTopicIds = useMemo(() => {
    const ids = new Set<string>();
    for (const topic of TOPICS) {
      const state = getTopicSelectionState(
        topic,
        selectedSubtopics,
        selectedArticles,
      );
      if (state === 'full' || state === 'partial') ids.add(topic.id);
    }
    return Array.from(ids);
  }, [selectedSubtopics, selectedArticles]);

  const selectedCount =
    selectedSubtopics.size + selectedArticles.size;

  // ---------- Generar test ----------

  const start = async () => {
    setErrorMsg(null);

    if (!oppositionId) {
      const msg = 'No se encontró oposición en el servidor.';
      setErrorMsg(msg);
      Alert.alert('Sin oposición', msg);
      return;
    }

    if (mode === 'topics' && selectedTopicIds.length === 0) {
      const msg = 'Selecciona al menos un tema, subtema o artículo.';
      setErrorMsg(msg);
      Alert.alert('Selecciona contenido', msg);
      return;
    }

    if (mode !== 'real' && count > dailyLimit) {
      Alert.alert(
        'Límite diario',
        `Tu plan (${plan}) permite ${dailyLimit} preguntas al día. Reduce el número o pásate a Premium.`,
      );
      return;
    }

    setStarting(true);

    try {
      const type =
        mode === 'real' ? 'REAL' : mode === 'general' ? 'GLOBAL' : 'PRACTICE';
      const timeLimitSec =
        mode === 'real' ? 144 * 60 : getTimeLimitSec(count);

      const articleIds = Array.from(selectedArticles);

      const payload: any = {
        oppositionId,
        count: mode === 'real' ? 100 : count,
        type,
        selection:
          mode === 'general'
            ? 'GLOBAL'
            : articleIds.length > 0
              ? 'ARTICLE'
              : 'TOPIC',
        topicIds: mode === 'topics' ? selectedTopicIds : [],
        articleIds: mode === 'topics' ? articleIds : [],
        timeLimitSec,
      };

      const test = await generateTest(payload);

      if (!test?.attemptId || !test?.questions?.length) {
        throw new Error(
          'El backend no devolvió preguntas. Puede que el Excel aún no se haya importado o que no haya preguntas asociadas a la selección.',
        );
      }

      router.push({
        pathname: `/test/${test.attemptId}` as any,
        params: { payload: JSON.stringify(test) },
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo generar el test';
      const text = Array.isArray(msg) ? msg.join('\n') : String(msg);
      setErrorMsg(text);
      Alert.alert('Error', text);
    } finally {
      setStarting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as any);
  };

  if (loadingOpp) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const effectiveCount = mode === 'real' ? 100 : count;
  const effectiveTime =
    mode === 'real' ? 144 * 60 : getTimeLimitSec(count);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDesktop
            ? (colors as any).backgroundAlt || colors.background
            : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          isDesktop && styles.shellDesktop,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.back,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              CONFIGURACIÓN
            </Text>
            <Text
              style={[
                styles.title,
                isDesktop && styles.titleDesktop,
                { color: colors.text },
              ]}
            >
              {mode === 'real' ? 'Simulacro de examen' : 'Crear test'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {mode === 'real'
                ? 'Reproduce las condiciones del examen real.'
                : `Plan ${plan} · ${dailyLimit} preguntas/día`}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            isDesktop && styles.contentDesktop,
          ]}
        >
          {errorMsg ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: `${(colors as any).danger || '#F87171'}12`,
                  borderColor: (colors as any).danger || '#F87171',
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={(colors as any).danger || '#F87171'}
              />
              <Text
                style={[
                  styles.error,
                  { color: (colors as any).danger || '#F87171' },
                ]}
              >
                {errorMsg}
              </Text>
            </View>
          ) : null}

          {mode === 'real' ? (
            <View
              style={[
                styles.realCard,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={styles.realIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={28}
                  color={colors.primaryText}
                />
              </View>
              <Text style={[styles.realTitle, { color: colors.primaryText }]}>
                Simulacro de examen
              </Text>
              <Text
                style={[styles.realDescription, { color: colors.primaryText }]}
              >
                Todo el temario · 100 preguntas · 144 minutos
              </Text>
              <View style={styles.realStats}>
                <View style={styles.realStat}>
                  <Text
                    style={[
                      styles.realStatValue,
                      { color: colors.primaryText },
                    ]}
                  >
                    100
                  </Text>
                  <Text
                    style={[
                      styles.realStatLabel,
                      { color: colors.primaryText },
                    ]}
                  >
                    preguntas
                  </Text>
                </View>
                <View style={styles.realDivider} />
                <View style={styles.realStat}>
                  <Text
                    style={[
                      styles.realStatValue,
                      { color: colors.primaryText },
                    ]}
                  >
                    144
                  </Text>
                  <Text
                    style={[
                      styles.realStatLabel,
                      { color: colors.primaryText },
                    ]}
                  >
                    minutos
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Tipo de test
              </Text>

              <View style={styles.modeGrid}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMode('general')}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor:
                        mode === 'general'
                          ? `${colors.primary}16`
                          : colors.surface,
                      borderColor:
                        mode === 'general' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      {
                        backgroundColor:
                          mode === 'general'
                            ? colors.primary
                            : `${colors.primary}16`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="library-outline"
                      size={22}
                      color={
                        mode === 'general'
                          ? colors.primaryText
                          : colors.primary
                      }
                    />
                  </View>
                  <Text style={[styles.modeTitle, { color: colors.text }]}>
                    Banco completo
                  </Text>
                  <Text
                    style={[
                      styles.modeDescription,
                      { color: colors.textMuted },
                    ]}
                  >
                    Toda la oposición
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMode('topics')}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor:
                        mode === 'topics'
                          ? `${colors.primary}16`
                          : colors.surface,
                      borderColor:
                        mode === 'topics' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      {
                        backgroundColor:
                          mode === 'topics'
                            ? colors.primary
                            : `${colors.primary}16`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="list-outline"
                      size={22}
                      color={
                        mode === 'topics'
                          ? colors.primaryText
                          : colors.primary
                      }
                    />
                  </View>
                  <Text style={[styles.modeTitle, { color: colors.text }]}>
                    Por temas
                  </Text>
                  <Text
                    style={[
                      styles.modeDescription,
                      { color: colors.textMuted },
                    ]}
                  >
                    Tema → Subtema → Artículo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setMode('real');
                    setCount(100);
                  }}
                  style={[
                    styles.modeCard,
                    styles.modeCardFull,
                    {
                      backgroundColor: `${colors.primary}12`,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={22}
                      color={colors.primaryText}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeTitle, { color: colors.text }]}>
                      Test real (Simulacro)
                    </Text>
                    <Text
                      style={[
                        styles.modeDescription,
                        { color: colors.textMuted },
                      ]}
                    >
                      100 preguntas · 144 minutos · Todo el temario
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Número de preguntas
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.textMuted },
                    ]}
                  >
                    Tiempo estimado: {formatTime(effectiveTime)} · Límite:{' '}
                    {dailyLimit}/día
                  </Text>
                </View>
                <View
                  style={[
                    styles.countSummary,
                    { backgroundColor: `${colors.primary}16` },
                  ]}
                >
                  <Text
                    style={[
                      styles.countSummaryText,
                      { color: colors.primary },
                    ]}
                  >
                    {effectiveCount}
                  </Text>
                </View>
              </View>

              <View style={styles.countGrid}>
                {COUNTS.map((c) => {
                  const active = count === c;
                  const disabled = c > dailyLimit;
                  return (
                    <TouchableOpacity
                      key={c}
                      activeOpacity={0.85}
                      onPress={() => !disabled && setCount(c)}
                      disabled={disabled}
                      style={[
                        styles.countButton,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.surface,
                          borderColor: active
                            ? colors.primary
                            : colors.border,
                          opacity: disabled ? 0.4 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          {
                            color: active
                              ? colors.primaryText
                              : colors.text,
                          },
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {mode === 'topics' && (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionHeaderText}>
                      <Text
                        style={[styles.sectionTitle, { color: colors.text }]}
                      >
                        Temas, subtemas y artículos
                      </Text>
                      <Text
                        style={[
                          styles.sectionSubtitle,
                          { color: colors.textMuted },
                        ]}
                      >
                        Los artículos (sub-subtemas) aparecerán cuando se
                        importen desde el Excel.
                      </Text>
                    </View>
                    {selectedCount > 0 ? (
                      <View
                        style={[
                          styles.selectionBadge,
                          { backgroundColor: `${colors.primary}16` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectionBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          {selectedCount} seleccionados
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {TOPICS.map((topic) => {
                    const topicState = getTopicSelectionState(
                      topic,
                      selectedSubtopics,
                      selectedArticles,
                    );
                    const topicExpanded = expandedTopics.includes(topic.id);

                    return (
                      <View key={topic.id}>
                        {/* TEMA */}
                        <View
                          style={[
                            styles.topicRow,
                            {
                              backgroundColor:
                                topicState !== 'none'
                                  ? `${colors.primary}10`
                                  : colors.surface,
                              borderColor:
                                topicState !== 'none'
                                  ? colors.primary
                                  : colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => toggleTopic(topic)}
                            style={styles.checkArea}
                          >
                            <Ionicons
                              name={
                                topicState === 'full'
                                  ? 'checkbox'
                                  : topicState === 'partial'
                                    ? 'remove'
                                    : 'square-outline'
                              }
                              size={22}
                              color={
                                topicState !== 'none'
                                  ? colors.primary
                                  : colors.textMuted
                              }
                            />
                          </TouchableOpacity>

                          <View style={styles.topicIcon}>
                            <Ionicons
                              name={(topic.icon || 'book-outline') as any}
                              size={20}
                              color={topic.color || colors.primary}
                            />
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => toggleExpandedTopic(topic.id)}
                            style={styles.topicContent}
                          >
                            <Text
                              style={[
                                styles.topicName,
                                { color: colors.text },
                              ]}
                              numberOfLines={2}
                            >
                              {topic.name}
                            </Text>
                            <Text
                              style={[
                                styles.topicMeta,
                                { color: colors.textMuted },
                              ]}
                            >
                              {topic.subtopics?.length || 0} subtemas
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => toggleExpandedTopic(topic.id)}
                            style={styles.expandButton}
                          >
                            <Ionicons
                              name={
                                topicExpanded ? 'chevron-up' : 'chevron-down'
                              }
                              size={20}
                              color={colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* SUBTEMAS */}
                        {topicExpanded &&
                          topic.subtopics?.map((sub) => {
                            const subState = getSubtopicSelectionState(
                              sub,
                              selectedArticles,
                              selectedSubtopics,
                            );
                            const subExpanded = expandedSubtopics.includes(
                              sub.id,
                            );
                            const hasArticles =
                              Array.isArray(sub.articles) &&
                              sub.articles.length > 0;

                            return (
                              <View key={sub.id}>
                                <View
                                  style={[
                                    styles.subtopicRow,
                                    {
                                      borderBottomColor: colors.border,
                                      backgroundColor:
                                        subState !== 'none'
                                          ? `${colors.primary}08`
                                          : 'transparent',
                                      marginLeft: 28,
                                    },
                                  ]}
                                >
                                  <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => toggleSubtopic(sub)}
                                    style={styles.checkArea}
                                  >
                                    <Ionicons
                                      name={
                                        subState === 'full'
                                          ? 'checkbox'
                                          : subState === 'partial'
                                            ? 'remove'
                                            : 'square-outline'
                                      }
                                      size={20}
                                      color={
                                        subState !== 'none'
                                          ? colors.primary
                                          : colors.textMuted
                                      }
                                    />
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() =>
                                      hasArticles &&
                                      toggleExpandedSubtopic(sub.id)
                                    }
                                    style={styles.topicContent}
                                  >
                                    <Text
                                      style={[
                                        styles.subtopicName,
                                        {
                                          color:
                                            subState !== 'none'
                                              ? colors.text
                                              : colors.textMuted,
                                        },
                                      ]}
                                    >
                                      {sub.name}
                                    </Text>
                                    {hasArticles ? (
                                      <Text
                                        style={[
                                          styles.topicMeta,
                                          { color: colors.textMuted },
                                        ]}
                                      >
                                        {sub.articles.length} artículos
                                      </Text>
                                    ) : null}
                                  </TouchableOpacity>

                                  {hasArticles ? (
                                    <TouchableOpacity
                                      activeOpacity={0.8}
                                      onPress={() =>
                                        toggleExpandedSubtopic(sub.id)
                                      }
                                      style={styles.expandButton}
                                    >
                                      <Ionicons
                                        name={
                                          subExpanded
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                        }
                                        size={18}
                                        color={colors.textMuted}
                                      />
                                    </TouchableOpacity>
                                  ) : null}
                                </View>

                                {/* ARTÍCULOS (sub-subtemas) */}
                                {subExpanded &&
                                  hasArticles &&
                                  sub.articles.map((art) => {
                                    const active = selectedArticles.has(
                                      art.id,
                                    );
                                    return (
                                      <TouchableOpacity
                                        key={art.id}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                          toggleArticle(art, sub)
                                        }
                                        style={[
                                          styles.articleRow,
                                          {
                                            marginLeft: 56,
                                            backgroundColor: active
                                              ? `${colors.primary}10`
                                              : colors.surface,
                                            borderColor: active
                                              ? colors.primary
                                              : colors.border,
                                          },
                                        ]}
                                      >
                                        <Ionicons
                                          name={
                                            active
                                              ? 'checkbox'
                                              : 'square-outline'
                                          }
                                          size={18}
                                          color={
                                            active
                                              ? colors.primary
                                              : colors.textMuted
                                          }
                                        />
                                        <Text
                                          style={[
                                            styles.articleName,
                                            { color: colors.text },
                                          ]}
                                        >
                                          {art.number
                                            ? `Art. ${art.number} — ${art.name}`
                                            : art.name}
                                          {art.questions > 0
                                            ? ` (${art.questions})`
                                            : ' (0)'}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                              </View>
                            );
                          })}
                      </View>
                    );
                  })}

                  <Text style={[styles.helper, { color: colors.textMuted }]}>
                    Los artículos aparecerán aquí cuando se importen desde el
                    Excel y se asocien a cada subtema en el backend. Mientras
                    tanto puedes seleccionar temas y subtemas.
                  </Text>
                </>
              )}

              {mode === 'general' && (
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: `${colors.primary}16` },
                    ]}
                  >
                    <Ionicons
                      name="shuffle-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.infoTextBox}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                      Banco completo
                    </Text>
                    <Text
                      style={[styles.infoText, { color: colors.textMuted }]}
                    >
                      Se seleccionarán aleatoriamente preguntas publicadas de
                      toda la oposición.
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <View>
                <Text
                  style={[styles.summaryEyebrow, { color: colors.primary }]}
                >
                  RESUMEN
                </Text>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Tu test
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle-outline"
                size={25}
                color={colors.primary}
              />
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {effectiveCount}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textMuted }]}
                >
                  preguntas
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatTime(effectiveTime)}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textMuted }]}
                >
                  tiempo
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {mode === 'real'
                    ? 'Completo'
                    : mode === 'general'
                      ? 'Global'
                      : selectedTopicIds.length}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textMuted }]}
                >
                  {mode === 'real'
                    ? 'temario'
                    : mode === 'general'
                      ? 'banco'
                      : 'temas'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.startBtn,
              {
                backgroundColor: colors.primary,
                opacity: starting ? 0.7 : 1,
              },
            ]}
            onPress={start}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <>
                <Text
                  style={[styles.startText, { color: colors.primaryText }]}
                >
                  {mode === 'real' ? 'Comenzar simulacro' : 'Comenzar test'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.primaryText}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  shell: { flex: 1, width: '100%', maxWidth: 500 },
  shellDesktop: {
    width: '94%',
    maxWidth: 1180,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 20,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'web' ? 20 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerDesktop: {
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 18,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  title: { fontSize: 25, fontWeight: '900' },
  titleDesktop: { fontSize: 30 },
  subtitle: { marginTop: 4, fontSize: 13, lineHeight: 19 },
  content: { paddingHorizontal: 16, paddingBottom: 130, gap: 14 },
  contentDesktop: { paddingHorizontal: 32, paddingBottom: 140 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  error: { flex: 1, fontSize: 12, lineHeight: 18 },
  realCard: { borderWidth: 1, borderRadius: 22, padding: 22 },
  realIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  realTitle: { marginTop: 17, fontSize: 24, fontWeight: '900' },
  realDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.9,
  },
  realStats: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  realStat: { flex: 1 },
  realStatValue: { fontSize: 25, fontWeight: '900' },
  realStatLabel: { marginTop: 2, fontSize: 11, opacity: 0.85 },
  realDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  modeCard: {
    width: '48.5%',
    minHeight: 124,
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
  },
  modeCardFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 90,
  },
  modeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: { marginTop: 10, fontSize: 14, fontWeight: '800' },
  modeDescription: { marginTop: 3, fontSize: 11, lineHeight: 16 },
  countSummary: {
    minWidth: 42,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  countSummaryText: { fontSize: 14, fontWeight: '900' },
  countGrid: { flexDirection: 'row', gap: 8 },
  countButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 14, fontWeight: '900' },
  selectionBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  selectionBadgeText: { fontSize: 10, fontWeight: '800' },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 7,
  },
  checkArea: { width: 36, alignItems: 'center', justifyContent: 'center' },
  topicIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  topicContent: { flex: 1, marginLeft: 10, marginRight: 4 },
  topicName: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  topicMeta: { marginTop: 3, fontSize: 11 },
  expandButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingRight: 8,
  },
  subtopicName: { flex: 1, fontSize: 12, lineHeight: 17 },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  articleName: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  helper: { fontSize: 11, lineHeight: 17, marginTop: 4 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBox: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '800' },
  infoText: { marginTop: 3, fontSize: 12, lineHeight: 18 },
  summaryCard: { borderWidth: 1, borderRadius: 18, padding: 16 },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  summaryTitle: { marginTop: 2, fontSize: 18, fontWeight: '900' },
  summaryGrid: { flexDirection: 'row', marginTop: 18 },
  summaryItem: { flex: 1 },
  summaryValue: { fontSize: 17, fontWeight: '900' },
  summaryLabel: { marginTop: 2, fontSize: 10 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'web' ? 12 : 22,
  },
  startBtn: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  startText: { fontSize: 15, fontWeight: '900' },
});