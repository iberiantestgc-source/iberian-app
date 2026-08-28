import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  submitAnswer,
  submitBlankAnswer,
  finishTest,
} from '../../src/api/tests';
import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from '../../src/api/favorites';
import type {
  GeneratedTest,
  AnswerResult,
  TestResult,
} from '../../src/types';
import { useAuthStore } from '../../src/context/authStore';
import { useThemeStore } from '../../src/context/themeStore';
import { Ionicons } from '@expo/vector-icons';

type CorrectionMode = 'immediate' | 'finish';

type QuestionState = {
  selectedAnswerId: string | null;
  answered: boolean;
  blank: boolean;
  markedForReview: boolean;
  favorite: boolean;
  submitted: boolean;
  result: AnswerResult | null;
};

const createInitialQuestionState = (): QuestionState => ({
  selectedAnswerId: null,
  answered: false,
  blank: false,
  markedForReview: false,
  favorite: false,
  submitted: false,
  result: null,
});

function normalizeCorrectionMode(
  value?: string | string[],
): CorrectionMode {
  const normalized = Array.isArray(value)
    ? value[0]
    : value;

  return normalized === 'finish'
    ? 'finish'
    : 'immediate';
}

export default function TestScreen() {
  const params = useLocalSearchParams<{
    attemptId?: string;
    payload?: string;
    correctionMode?: string | string[];
  }>();

  const { colors } = useThemeStore();
  const { width } = useWindowDimensions();
  const loadUser = useAuthStore((state) => state.loadUser);

  const isDesktop =
    Platform.OS === 'web' && width >= 1000;

  const correctionMode = normalizeCorrectionMode(
    params.correctionMode,
  );

  const test: GeneratedTest | null = useMemo(() => {
    try {
      const payload = Array.isArray(params.payload)
        ? params.payload[0]
        : params.payload;

      if (!payload) {
        return null;
      }

      const parsed = JSON.parse(
        payload,
      ) as GeneratedTest;

      return parsed;
    } catch {
      return null;
    }
  }, [params.payload]);

  const [index, setIndex] = useState(0);

  const [questionStates, setQuestionStates] =
    useState<QuestionState[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [finished, setFinished] =
    useState<TestResult | null>(null);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [loadingFavorites, setLoadingFavorites] =
    useState(false);

  const [showQuestionNavigator, setShowQuestionNavigator] =
    useState(false);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  /*
   * Inicializamos el estado de cada pregunta.
   */
  useEffect(() => {
    if (!test?.questions?.length) {
      return;
    }

    setQuestionStates((previous) => {
      if (
        previous.length ===
        test.questions.length
      ) {
        return previous;
      }

      return test.questions.map(() =>
        createInitialQuestionState(),
      );
    });
  }, [test]);

  /*
   * Temporizador.
   *
   * Cuando el tiempo llega a cero se finaliza automáticamente.
   */
  useEffect(() => {
    if (
      !test ||
      finished ||
      !test.timeLimitSec
    ) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((previous) => {
        const next = previous + 1;

        if (
          test.timeLimitSec &&
          next >= test.timeLimitSec
        ) {
          clearInterval(timer);
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [test, finished]);

  /*
   * Finalización automática cuando se agota el tiempo.
   */
  useEffect(() => {
    if (
      !test ||
      finished ||
      finishing ||
      !test.timeLimitSec
    ) {
      return;
    }

    if (
      elapsedSeconds >= test.timeLimitSec
    ) {
      void doFinish();
    }
  }, [
    elapsedSeconds,
    test,
    finished,
    finishing,
  ]);

  /*
   * Comprobar favoritos de las preguntas.
   */
  useEffect(() => {
    if (!test?.questions?.length) {
      return;
    }

    let cancelled = false;

    const loadFavorites = async () => {
      setLoadingFavorites(true);

      try {
        const states = await Promise.all(
          test.questions.map(
            async (question) => {
              try {
                const response =
                  await isFavorite(
                    question.id,
                  );

                return {
                  id: question.id,
                  favorite:
                    !!response?.isFavorite,
                };
              } catch {
                return {
                  id: question.id,
                  favorite: false,
                };
              }
            },
          ),
        );

        if (cancelled) {
          return;
        }

        setQuestionStates((previous) =>
          previous.map(
            (state, questionIndex) => ({
              ...state,
              favorite:
                states[questionIndex]
                  ?.favorite ??
                state.favorite,
            }),
          ),
        );
      } finally {
        if (!cancelled) {
          setLoadingFavorites(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [test]);

  if (!test) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color: colors.danger,
            },
          ]}
        >
          No se pudo cargar el test
        </Text>

        <Text
          style={[
            styles.hint,
            {
              color: colors.textMuted,
            },
          ]}
        >
          Genera el test desde /test/setup.
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.replace(
              '/test/setup' as any,
            )
          }
        >
          <Text
            style={[
              styles.link,
              {
                color: colors.primary,
              },
            ]}
          >
            Ir a configurar test
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const loadedTest = test;

  const question =
    loadedTest.questions[index];

  const currentState =
    questionStates[index] ??
    createInitialQuestionState();

  const isLast =
    index >=
    loadedTest.questions.length - 1;

  const answeredCount =
    questionStates.filter(
      (state) => state.answered,
    ).length;

  const blankCount =
    questionStates.filter(
      (state) => state.blank,
    ).length;

  const reviewCount =
    questionStates.filter(
      (state) =>
        state.markedForReview,
    ).length;

  const remainingCount =
    Math.max(
      loadedTest.questions.length -
        answeredCount,
      0,
    );

  const effectiveTime =
    loadedTest.timeLimitSec ?? 0;

  const remainingSeconds =
    Math.max(
      effectiveTime -
        elapsedSeconds,
      0,
    );

  const formatTime = (
    totalSeconds: number,
  ): string => {
    const hours =
      Math.floor(
        totalSeconds / 3600,
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
          60,
      );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(
        minutes,
      ).padStart(
        2,
        '0',
      )}:${String(
        seconds,
      ).padStart(
        2,
        '0',
      )}`;
    }

    return `${minutes}:${String(
      seconds,
    ).padStart(
      2,
      '0',
    )}`;
  };

  const updateQuestionState = (
    questionIndex: number,
    changes: Partial<QuestionState>,
  ) => {
    setQuestionStates(
      (previous) =>
        previous.map(
          (state, stateIndex) =>
            stateIndex ===
            questionIndex
              ? {
                  ...state,
                  ...changes,
                }
              : state,
        ),
    );
  };

  /*
   * FAVORITO
   */
  const toggleFavorite = async () => {
    if (
      !question ||
      favoriteLoading
    ) {
      return;
    }

    setFavoriteLoading(true);

    try {
      if (currentState.favorite) {
        await removeFavorite(
          question.id,
        );

        updateQuestionState(
          index,
          {
            favorite: false,
          },
        );
      } else {
        await addFavorite(
          question.id,
        );

        updateQuestionState(
          index,
          {
            favorite: true,
          },
        );
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        'No se pudo actualizar favoritos';

      Alert.alert(
        'Favoritos',
        Array.isArray(msg)
          ? msg.join('\n')
          : String(msg),
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  /*
   * MARCAR PARA REPASAR
   */
  const toggleReview = () => {
    updateQuestionState(
      index,
      {
        markedForReview:
          !currentState.markedForReview,
      },
    );
  };

  /*
   * CORRECCIÓN INMEDIATA
   */
  const onSelectImmediate = async (
    answerId: string,
  ) => {
    if (
      !question ||
      currentState.submitted ||
      submitting ||
      finishing
    ) {
      return;
    }

    updateQuestionState(
      index,
      {
        selectedAnswerId:
          answerId,
        answered: true,
        blank: false,
      },
    );

    setSubmitting(true);

    try {
      const res =
        await submitAnswer(
          loadedTest.attemptId,
          question.id,
          answerId,
        );

      updateQuestionState(
        index,
        {
          selectedAnswerId:
            answerId,
          answered: true,
          blank: false,
          submitted: true,
          result: res,
        },
      );
    } catch (e: any) {
      updateQuestionState(
        index,
        {
          selectedAnswerId:
            null,
          answered: false,
          blank: false,
          submitted: false,
          result: null,
        },
      );

      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          'Error al enviar la respuesta',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * CORRECCIÓN AL FINAL
   */
  const onSelectDeferred = (
    answerId: string,
  ) => {
    if (
      !question ||
      finishing
    ) {
      return;
    }

    updateQuestionState(
      index,
      {
        selectedAnswerId:
          answerId,
        answered: true,
        blank: false,
        submitted: false,
        result: null,
      },
    );
  };

  const onSelect = (
    answerId: string,
  ) => {
    if (
      correctionMode ===
      'immediate'
    ) {
      void onSelectImmediate(
        answerId,
      );
      return;
    }

    onSelectDeferred(
      answerId,
    );
  };

  /*
   * DEJAR EN BLANCO
   */
  const markBlank = async () => {
    if (
      !question ||
      submitting ||
      finishing
    ) {
      return;
    }

    if (
      correctionMode ===
      'finish'
    ) {
      updateQuestionState(
        index,
        {
          selectedAnswerId:
            null,
          answered: true,
          blank: true,
          submitted: false,
          result: null,
        },
      );

      return;
    }

    setSubmitting(true);

    try {
      await submitBlankAnswer(
        loadedTest.attemptId,
        question.id,
      );

      updateQuestionState(
        index,
        {
          selectedAnswerId:
            null,
          answered: true,
          blank: true,
          submitted: true,
          result: null,
        },
      );
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          'No se pudo guardar la pregunta en blanco',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * NAVEGACIÓN
   */
  const goToQuestion = (
    questionIndex: number,
  ) => {
    if (
      questionIndex < 0 ||
      questionIndex >=
        loadedTest.questions.length
    ) {
      return;
    }

    setIndex(questionIndex);
    setShowQuestionNavigator(
      false,
    );
  };

  const next = () => {
    if (
      correctionMode ===
        'immediate' &&
      !currentState.submitted
    ) {
      return;
    }

    if (isLast) {
      void doFinish();
      return;
    }

    setIndex(
      (previous) =>
        previous + 1,
    );
  };

  const previous = () => {
    if (index <= 0) {
      return;
    }

    setIndex(
      (previous) =>
        previous - 1,
    );
  };

  /*
   * FINALIZAR TEST
   */
  async function doFinish() {
    if (
      finishing ||
      finished
    ) {
      return;
    }

    setFinishing(true);

    try {
      /*
       * En modo diferido enviamos todas las respuestas
       * que todavía no hayan sido enviadas.
       */
      if (
        correctionMode ===
        'finish'
      ) {
        for (
          let i = 0;
          i <
          loadedTest.questions.length;
          i++
        ) {
          const state =
            questionStates[i];

          const currentQuestion =
            loadedTest.questions[i];

          if (
            !state ||
            !currentQuestion ||
            state.submitted
          ) {
            continue;
          }

          if (
            state.blank ||
            !state.selectedAnswerId
          ) {
            await submitBlankAnswer(
              loadedTest.attemptId,
              currentQuestion.id,
            );
          } else {
            await submitAnswer(
              loadedTest.attemptId,
              currentQuestion.id,
              state.selectedAnswerId,
            );
          }

          updateQuestionState(
            i,
            {
              submitted: true,
            },
          );
        }
      }

      const res =
        await finishTest(
          loadedTest.attemptId,
        );

      setFinished(res);

      await loadUser();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          e?.message ||
          'Error al finalizar',
      );
    } finally {
      setFinishing(false);
    }
  }

  /*
   * RESULTADO
   */
  if (finished) {
    const achievements =
      finished.newAchievements ||
      [];

    return (
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
        contentContainerStyle={[
          styles.resultContent,
          isDesktop &&
            styles.resultContentDesktop,
        ]}
      >
        <View
          style={[
            styles.resultIcon,
            {
              backgroundColor:
                `${colors.primary}18`,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={colors.primary}
          />
        </View>

        <Text
          style={[
            styles.resultTitle,
            {
              color: colors.text,
            },
          ]}
        >
          ¡Test finalizado!
        </Text>

        <Text
          style={[
            styles.score,
            {
              color: colors.primary,
            },
          ]}
        >
          {Math.round(
            Number(
              finished.score,
            ) || 0,
          )}
          %
        </Text>

        <Text
          style={[
            styles.resultMeta,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          {finished.correctCount ??
            0}{' '}
          aciertos ·{' '}
          {finished.wrongCount ??
            0}{' '}
          fallos ·{' '}
          {finished.unansweredCount ??
            0}{' '}
          en blanco
        </Text>

        <Text
          style={[
            styles.xp,
            {
              color:
                colors.primary,
            },
          ]}
        >
          +{finished.xpEarned ?? 0}{' '}
          XP
        </Text>

        <Text
          style={[
            styles.streak,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          Racha:{' '}
          {finished.dailyStreak ??
            0}{' '}
          días
        </Text>

        {achievements.length >
          0 && (
          <View
            style={[
              styles.achBox,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.achTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ¡Nuevos logros!
            </Text>

            {achievements.map(
              (achievement) => (
                <Text
                  key={
                    achievement.code ||
                    achievement.name
                  }
                  style={[
                    styles.achItem,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  🏆{' '}
                  {
                    achievement.name
                  }{' '}
                  (+{achievement.xpReward ??
                    0}{' '}
                  XP)
                </Text>
              ),
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.replace(
              '/(tabs)' as any,
            )
          }
        >
          <Text
            style={[
              styles.primaryBtnText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!question) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color: colors.text,
            },
          ]}
        >
          Pregunta no disponible
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={[
              styles.link,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentResult =
    currentState.result;

  const selectedAnswerId =
    currentState.selectedAnswerId;

  const correctAnswerId =
    currentResult?.correctAnswerId;

  const showImmediateResult =
    correctionMode ===
      'immediate' &&
    !!currentResult;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* CABECERA */}

      <View
        style={[
          styles.topBar,
          {
            backgroundColor:
              colors.background,
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={[
            styles.topIconButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            setShowQuestionNavigator(
              (previous) =>
                !previous,
            )
          }
          style={
            styles.progressCenter
          }
        >
          <Text
            style={[
              styles.progressText,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Pregunta {index + 1} /{' '}
            {loadedTest.totalQuestions}
          </Text>

          <Text
            style={[
              styles.progressHint,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            {answeredCount}{' '}
            contestadas ·{' '}
            {remainingCount > 0
              ? `${remainingCount} pendientes`
              : 'completado'}
          </Text>
        </TouchableOpacity>

        <View
          style={styles.topActions}
        >
          <TouchableOpacity
            onPress={
              toggleFavorite
            }
            disabled={
              favoriteLoading ||
              loadingFavorites
            }
            style={[
              styles.topIconButton,
              {
                backgroundColor:
                  currentState.favorite
                    ? `${colors.primary}18`
                    : colors.surface,
                borderColor:
                  currentState.favorite
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Ionicons
              name={
                currentState.favorite
                  ? 'star'
                  : 'star-outline'
              }
              size={20}
              color={
                currentState.favorite
                  ? colors.primary
                  : colors.textMuted
              }
            />
          </TouchableOpacity>

          {isDesktop && (
            <TouchableOpacity
              onPress={() =>
                setShowQuestionNavigator(
                  (previous) =>
                    !previous,
                )
              }
              style={[
                styles.topIconButton,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Ionicons
                name="grid-outline"
                size={19}
                color={
                  colors.text
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* TEMPORIZADOR */}

      {effectiveTime > 0 && (
        <View
          style={[
            styles.timerBar,
            {
              backgroundColor:
                colors.surface,
              borderBottomColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.timerLeft
            }
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={
                remainingSeconds <=
                300
                  ? colors.danger
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.timerText,
                {
                  color:
                    remainingSeconds <=
                    300
                      ? colors.danger
                      : colors.text,
                },
              ]}
            >
              {formatTime(
                remainingSeconds,
              )}
            </Text>
          </View>

          <Text
            style={[
              styles.timerMode,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            {correctionMode ===
            'immediate'
              ? 'Corrección inmediata'
              : 'Corrección al finalizar'}
          </Text>
        </View>
      )}

      {/* CONTENIDO PRINCIPAL */}

      <View
        style={[
          styles.mainArea,
          isDesktop &&
            styles.mainAreaDesktop,
        ]}
      >
        <View
          style={[
            styles.questionPanel,
            isDesktop &&
              styles.questionPanelDesktop,
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.questionContent
            }
          >
            <View
              style={
                styles.questionHeader
              }
            >
              <View
                style={
                  styles.questionBadge
                }
              >
                <Text
                  style={[
                    styles.questionBadgeText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  PREGUNTA {index + 1}
                </Text>
              </View>

              <View
                style={
                  styles.questionActions
                }
              >
                <TouchableOpacity
                  onPress={
                    toggleReview
                  }
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        currentState.markedForReview
                          ? `${colors.primary}18`
                          : colors.surface,
                      borderColor:
                        currentState.markedForReview
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      currentState.markedForReview
                        ? 'bookmark'
                        : 'bookmark-outline'
                    }
                    size={18}
                    color={
                      currentState.markedForReview
                        ? colors.primary
                        : colors.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.actionText,
                      {
                        color:
                          currentState.markedForReview
                            ? colors.primary
                            : colors.textMuted,
                      },
                    ]}
                  >
                    Repasar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={[
                styles.statement,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {
                question.statement
              }
            </Text>

            {question.answers.map(
              (answer) => {
                let backgroundColor =
                  colors.surface;

                let borderColor =
                  colors.border;

                const answerTextColor =
                  colors.text;

                if (
                  showImmediateResult
                ) {
                  if (
                    correctAnswerId &&
                    answer.id ===
                      correctAnswerId
                  ) {
                    backgroundColor =
                      `${colors.primary}20`;

                    borderColor =
                      colors.primary;
                  } else if (
                    answer.id ===
                      selectedAnswerId &&
                    currentResult &&
                    !currentResult.isCorrect
                  ) {
                    backgroundColor =
                      `${colors.danger}18`;

                    borderColor =
                      colors.danger;
                  }
                } else if (
                  answer.id ===
                  selectedAnswerId
                ) {
                  backgroundColor =
                    `${colors.primary}20`;

                  borderColor =
                    colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={
                      answer.id
                    }
                    activeOpacity={
                      0.85
                    }
                    style={[
                      styles.answer,
                      {
                        backgroundColor,
                        borderColor,
                      },
                    ]}
                    onPress={() =>
                      onSelect(
                        answer.id,
                      )
                    }
                    disabled={
                      submitting ||
                      finishing ||
                      (correctionMode ===
                        'immediate' &&
                        currentState.submitted)
                    }
                  >
                    <View
                      style={[
                        styles.answerIndicator,
                        {
                          borderColor,
                          backgroundColor:
                            answer.id ===
                            selectedAnswerId
                              ? borderColor
                              : 'transparent',
                        },
                      ]}
                    >
                      {answer.id ===
                        selectedAnswerId && (
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={
                            colors.primaryText
                          }
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.answerText,
                        {
                          color:
                            answerTextColor,
                        },
                      ]}
                    >
                      {
                        answer.text
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}

            {/* EXPLICACIÓN */}

            {showImmediateResult &&
            currentResult?.explanation ? (
              <View
                style={[
                  styles.explanation,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      currentResult.isCorrect
                        ? colors.primary
                        : colors.danger,
                  },
                ]}
              >
                <View
                  style={
                    styles.explanationHeader
                  }
                >
                  <Ionicons
                    name={
                      currentResult.isCorrect
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={21}
                    color={
                      currentResult.isCorrect
                        ? colors.primary
                        : colors.danger
                    }
                  />

                  <Text
                    style={[
                      styles.explanationTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {currentResult.isCorrect
                      ? 'Correcto'
                      : 'Incorrecto'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.explanationText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {
                    currentResult.explanation
                  }
                </Text>
              </View>
            ) : null}

            {/* EN BLANCO */}

            {correctionMode ===
              'finish' &&
            currentState.blank ? (
              <View
                style={[
                  styles.blankNotice,
                  {
                    backgroundColor:
                      `${colors.primary}10`,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={19}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={[
                    styles.blankNoticeText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Esta pregunta se
                  dejará en blanco.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* BARRA INFERIOR */}

          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor:
                  colors.background,
                borderTopColor:
                  colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={
                previous
              }
              disabled={
                index === 0 ||
                finishing
              }
              style={[
                styles.navigationButton,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                  opacity:
                    index === 0
                      ? 0.4
                      : 1,
                },
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={19}
                color={
                  colors.text
                }
              />

              <Text
                style={[
                  styles.navigationText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Anterior
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                markBlank
              }
              disabled={
                submitting ||
                finishing ||
                (correctionMode ===
                  'immediate' &&
                  currentState.submitted)
              }
              style={[
                styles.blankButton,
                {
                  backgroundColor:
                    currentState.blank
                      ? `${colors.primary}18`
                      : colors.surface,
                  borderColor:
                    currentState.blank
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Ionicons
                name="remove-circle-outline"
                size={18}
                color={
                  currentState.blank
                    ? colors.primary
                    : colors.textMuted
                }
              />

              <Text
                style={[
                  styles.blankButtonText,
                  {
                    color:
                      currentState.blank
                        ? colors.primary
                        : colors.textMuted,
                  },
                ]}
              >
                {currentState.blank
                  ? 'En blanco'
                  : 'Dejar en blanco'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                next
              }
              disabled={
                finishing ||
                submitting ||
                (correctionMode ===
                  'immediate' &&
                  !currentState.submitted)
              }
              style={[
                styles.navigationButton,
                {
                  backgroundColor:
                    colors.primary,
                  borderColor:
                    colors.primary,
                  opacity:
                    finishing ||
                    submitting ||
                    (correctionMode ===
                      'immediate' &&
                      !currentState.submitted)
                      ? 0.55
                      : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.navigationText,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
              >
                {isLast
                  ? 'Finalizar'
                  : 'Siguiente'}
              </Text>

              <Ionicons
                name={
                  isLast
                    ? 'checkmark'
                    : 'arrow-forward'
                }
                size={19}
                color={
                  colors.primaryText
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* NAVEGADOR DESKTOP */}

        {isDesktop &&
          showQuestionNavigator && (
            <View
              style={[
                styles.navigator,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.navigatorHeader
                }
              >
                <View>
                  <Text
                    style={[
                      styles.navigatorTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Preguntas
                  </Text>

                  <Text
                    style={[
                      styles.navigatorSubtitle,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {answeredCount}/
                    {
                      loadedTest.totalQuestions
                    }{' '}
                    contestadas
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setShowQuestionNavigator(
                      false,
                    )
                  }
                >
                  <Ionicons
                    name="close"
                    size={21}
                    color={
                      colors.textMuted
                    }
                  />
                </TouchableOpacity>
              </View>

              <View
                style={
                  styles.navigatorStats
                }
              >
                <View
                  style={
                    styles.navigatorStat
                  }
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.legendText,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Contestada
                  </Text>
                </View>

                <View
                  style={
                    styles.navigatorStat
                  }
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          colors.border,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.legendText,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Pendiente
                  </Text>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.navigatorGrid
                }
              >
                {loadedTest.questions.map(
                  (
                    _item,
                    questionIndex,
                  ) => {
                    const state =
                      questionStates[
                        questionIndex
                      ];

                    const active =
                      questionIndex ===
                      index;

                    const answered =
                      !!state?.answered;

                    const review =
                      !!state?.markedForReview;

                    const favorite =
                      !!state?.favorite;

                    return (
                      <TouchableOpacity
                        key={
                          questionIndex
                        }
                        onPress={() =>
                          goToQuestion(
                            questionIndex,
                          )
                        }
                        style={[
                          styles.navigatorQuestion,
                          {
                            backgroundColor:
                              active
                                ? colors.primary
                                : answered
                                ? `${colors.primary}18`
                                : colors.background,
                            borderColor:
                              active
                                ? colors.primary
                                : answered
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.navigatorQuestionText,
                            {
                              color:
                                active
                                  ? colors.primaryText
                                  : colors.text,
                            },
                          ]}
                        >
                          {questionIndex +
                            1}
                        </Text>

                        {review && (
                          <View
                            style={[
                              styles.navigatorReview,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                          />
                        )}

                        {favorite && (
                          <Ionicons
                            name="star"
                            size={9}
                            color={
                              colors.primary
                            }
                            style={
                              styles.navigatorFavorite
                            }
                          />
                        )}
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>

              <View
                style={[
                  styles.navigatorFooter,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.navigatorFooterText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {reviewCount}{' '}
                  para repasar ·{' '}
                  {blankCount}{' '}
                  en blanco
                </Text>
              </View>
            </View>
          )}
      </View>

      {/* NAVEGADOR MÓVIL */}

      {!isDesktop &&
        showQuestionNavigator && (
          <View
            style={[
              styles.mobileNavigatorOverlay,
              {
                backgroundColor:
                  'rgba(0,0,0,0.45)',
              },
            ]}
          >
            <View
              style={[
                styles.mobileNavigator,
                {
                  backgroundColor:
                    colors.background,
                  borderTopColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.mobileNavigatorHeader
                }
              >
                <View>
                  <Text
                    style={[
                      styles.navigatorTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Preguntas
                  </Text>

                  <Text
                    style={[
                      styles.navigatorSubtitle,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {answeredCount}/
                    {
                      loadedTest.totalQuestions
                    }{' '}
                    contestadas
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setShowQuestionNavigator(
                      false,
                    )
                  }
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={
                      colors.textMuted
                    }
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.mobileNavigatorGrid
                }
              >
                {loadedTest.questions.map(
                  (
                    _item,
                    questionIndex,
                  ) => {
                    const state =
                      questionStates[
                        questionIndex
                      ];

                    const active =
                      questionIndex ===
                      index;

                    const answered =
                      !!state?.answered;

                    const review =
                      !!state?.markedForReview;

                    return (
                      <TouchableOpacity
                        key={
                          questionIndex
                        }
                        onPress={() =>
                          goToQuestion(
                            questionIndex,
                          )
                        }
                        style={[
                          styles.navigatorQuestion,
                          {
                            backgroundColor:
                              active
                                ? colors.primary
                                : answered
                                ? `${colors.primary}18`
                                : colors.surface,
                            borderColor:
                              active
                                ? colors.primary
                                : answered
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.navigatorQuestionText,
                            {
                              color:
                                active
                                  ? colors.primaryText
                                  : colors.text,
                            },
                          ]}
                        >
                          {questionIndex +
                            1}
                        </Text>

                        {review && (
                          <View
                            style={[
                              styles.navigatorReview,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>

              <View
                style={[
                  styles.mobileNavigatorFooter,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.navigatorFooterText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {reviewCount}{' '}
                  para repasar ·{' '}
                  {blankCount}{' '}
                  en blanco
                </Text>
              </View>
            </View>
          </View>
        )}

      {/* CONFIRMACIÓN FINAL */}

      {finishing && (
        <View
          style={[
            styles.finishingOverlay,
            {
              backgroundColor:
                'rgba(0,0,0,0.55)',
            },
          ]}
        >
          <View
            style={[
              styles.finishingCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.finishingTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Finalizando test...
            </Text>

            <Text
              style={[
                styles.finishingText,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Guardando tus respuestas
              y calculando el resultado.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  errorText: {
    marginBottom: 12,
    fontWeight: '800',
    fontSize: 16,
  },

  hint: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  link: {
    fontWeight: '700',
  },

  topBar: {
    minHeight: 68,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  topIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCenter: {
    flex: 1,
    alignItems: 'center',
  },

  progressText: {
    fontSize: 14,
    fontWeight: '900',
  },

  progressHint: {
    marginTop: 3,
    fontSize: 10,
  },

  topActions: {
    flexDirection: 'row',
    gap: 7,
  },

  timerBar: {
    minHeight: 42,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  timerText: {
    fontSize: 13,
    fontWeight: '900',
  },

  timerMode: {
    fontSize: 10,
    fontWeight: '600',
  },

  mainArea: {
    flex: 1,
  },

  mainAreaDesktop: {
    flexDirection: 'row',
  },

  questionPanel: {
    flex: 1,
  },

  questionPanelDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },

  questionContent: {
    padding: 18,
    paddingBottom: 150,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },

  questionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor:
      'rgba(128,128,128,0.08)',
  },

  questionBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  questionActions: {
    flexDirection: 'row',
  },

  actionButton: {
    minHeight: 36,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  statement: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 22,
  },

  answer: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  answerIndicator: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  answerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },

  explanation: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },

  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  explanationTitle: {
    fontSize: 14,
    fontWeight: '900',
  },

  explanationText: {
    fontSize: 13,
    lineHeight: 20,
  },

  blankNotice: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  blankNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom:
      Platform.OS === 'web'
        ? 10
        : 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  navigationButton: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  navigationText: {
    fontSize: 12,
    fontWeight: '900',
  },

  blankButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  blankButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },

  navigator: {
    width: 285,
    borderWidth: 1,
    borderRadius: 18,
    margin: 14,
    marginLeft: 0,
    overflow: 'hidden',
  },

  navigatorHeader: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navigatorTitle: {
    fontSize: 17,
    fontWeight: '900',
  },

  navigatorSubtitle: {
    marginTop: 3,
    fontSize: 10,
  },

  navigatorStats: {
    paddingHorizontal: 15,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },

  navigatorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 9,
  },

  navigatorGrid: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  navigatorQuestion: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  navigatorQuestionText: {
    fontSize: 11,
    fontWeight: '900',
  },

  navigatorReview: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    top: 4,
    left: 4,
  },

  navigatorFavorite: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },

  navigatorFooter: {
    borderTopWidth: 1,
    padding: 12,
  },

  navigatorFooterText: {
    fontSize: 9,
    lineHeight: 15,
  },

  mobileNavigatorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },

  mobileNavigator: {
    maxHeight: '72%',
    borderTopWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
  },

  mobileNavigatorHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mobileNavigatorGrid: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  mobileNavigatorFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  finishingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  finishingCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },

  finishingTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '900',
  },

  finishingText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },

  resultContent: {
    padding: 24,
    alignItems: 'center',
  },

  resultContentDesktop: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    paddingTop: 60,
  },

  resultIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  resultTitle: {
    fontSize: 25,
    fontWeight: '900',
    marginTop: 20,
  },

  score: {
    fontSize: 58,
    fontWeight: '900',
    marginTop: 14,
  },

  resultMeta: {
    marginTop: 7,
    fontSize: 14,
    textAlign: 'center',
  },

  xp: {
    marginTop: 17,
    fontSize: 20,
    fontWeight: '900',
  },

  streak: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: '700',
  },

  achBox: {
    marginTop: 24,
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  achTitle: {
    fontWeight: '900',
    marginBottom: 8,
    fontSize: 15,
  },

  achItem: {
    marginTop: 5,
    fontSize: 12,
  },

  primaryBtn: {
    width: '100%',
    marginTop: 25,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtnText: {
    fontWeight: '900',
    fontSize: 15,
  },
});