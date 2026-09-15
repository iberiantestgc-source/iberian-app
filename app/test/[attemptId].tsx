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
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'finish' ? 'finish' : 'immediate';
}

/** Baraja respuestas solo para la UI. No cambia los id. */
function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
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

  const isDesktop = Platform.OS === 'web' && width >= 1000;

  const correctionMode = normalizeCorrectionMode(params.correctionMode);

  const test: GeneratedTest | null = useMemo(() => {
    try {
      const payload = Array.isArray(params.payload)
        ? params.payload[0]
        : params.payload;

      if (!payload) {
        return null;
      }

      const parsed = JSON.parse(payload) as GeneratedTest;

      if (!parsed?.questions?.length) {
        return parsed;
      }

      return {
        ...parsed,
        questions: parsed.questions.map((question) => ({
          ...question,
          answers: shuffleArray(question.answers ?? []),
        })),
      };
    } catch {
      return null;
    }
  }, [params.payload]);

  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    [],
  );
  const [submitting, setSubmitting] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [finished, setFinished] =
    useState<TestResult | null>(null);

  const [favoriteLoadingIndex, setFavoriteLoadingIndex] =
    useState<number | null>(null);

  const [loadingFavorites, setLoadingFavorites] =
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
      finishing ||
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
  }, [test, finished, finishing]);

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
   * Comprobar favoritos de todas las preguntas.
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
  const toggleFavorite = async (
    questionIndex: number,
  ) => {
    const question =
      loadedTest.questions[
        questionIndex
      ];

    const currentState =
      questionStates[
        questionIndex
      ] ??
      createInitialQuestionState();

    if (
      !question ||
      favoriteLoadingIndex !== null ||
      finishing
    ) {
      return;
    }

    setFavoriteLoadingIndex(
      questionIndex,
    );

    try {
      if (currentState.favorite) {
        await removeFavorite(
          question.id,
        );

        updateQuestionState(
          questionIndex,
          {
            favorite: false,
          },
        );
      } else {
        await addFavorite(
          question.id,
        );

        updateQuestionState(
          questionIndex,
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
      setFavoriteLoadingIndex(
        null,
      );
    }
  };

  /*
   * MARCAR PARA REPASAR
   */
  const toggleReview = (
    questionIndex: number,
  ) => {
    const currentState =
      questionStates[
        questionIndex
      ] ??
      createInitialQuestionState();

    if (finishing) {
      return;
    }

    updateQuestionState(
      questionIndex,
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
    questionIndex: number,
    answerId: string,
  ) => {
    const question =
      loadedTest.questions[
        questionIndex
      ];

    const currentState =
      questionStates[
        questionIndex
      ] ??
      createInitialQuestionState();

    if (
      !question ||
      currentState.submitted ||
      submitting ||
      finishing
    ) {
      return;
    }

    updateQuestionState(
      questionIndex,
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
        questionIndex,
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
        questionIndex,
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
    questionIndex: number,
    answerId: string,
  ) => {
    if (finishing) {
      return;
    }

    updateQuestionState(
      questionIndex,
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
    questionIndex: number,
    answerId: string,
  ) => {
    if (
      correctionMode ===
      'immediate'
    ) {
      void onSelectImmediate(
        questionIndex,
        answerId,
      );
      return;
    }

    onSelectDeferred(
      questionIndex,
      answerId,
    );
  };

  /*
   * DEJAR EN BLANCO
   */
  const markBlank = async (
    questionIndex: number,
  ) => {
    const question =
      loadedTest.questions[
        questionIndex
      ];

    const currentState =
      questionStates[
        questionIndex
      ] ??
      createInitialQuestionState();

    if (
      !question ||
      submitting ||
      finishing ||
      (
        correctionMode ===
          'immediate' &&
        currentState.submitted
      )
    ) {
      return;
    }

    if (
      correctionMode ===
      'finish'
    ) {
      updateQuestionState(
        questionIndex,
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
        questionIndex,
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
        const states =
          questionStates;

        for (
          let i = 0;
          i <
          loadedTest.questions.length;
          i++
        ) {
          const state =
            states[i];

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

    const percentage =
      Number(
        finished.percentage ??
          finished.score ??
          0,
      ) || 0;

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
            percentage,
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
          disabled={finishing}
          style={[
            styles.topIconButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              opacity:
                finishing ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        <View
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
            Test ·{' '}
            {
              loadedTest.totalQuestions
            }{' '}
            preguntas
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
        </View>

        <View
          style={styles.topActions}
        >
          <View
            style={[
              styles.counterBadge,
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
                styles.counterBadgeText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {answeredCount}/
              {
                loadedTest.totalQuestions
              }
            </Text>
          </View>
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
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.questionsContent,
            isDesktop &&
              styles.questionsContentDesktop,
          ]}
        >
          {loadedTest.questions.map(
            (
              question,
              questionIndex,
            ) => {
              const currentState =
                questionStates[
                  questionIndex
                ] ??
                createInitialQuestionState();

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
                  key={question.id}
                  style={[
                    styles.questionCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        currentState.markedForReview
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.questionHeader
                    }
                  >
                    <View
                      style={
                        styles.questionHeaderLeft
                      }
                    >
                      <View
                        style={[
                          styles.questionBadge,
                          {
                            backgroundColor:
                              `${colors.primary}12`,
                          },
                        ]}
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
                          PREGUNTA{' '}
                          {questionIndex +
                            1}
                        </Text>
                      </View>

                      {currentState.answered && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                currentState.blank
                                  ? `${colors.textMuted}18`
                                  : `${colors.primary}18`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  currentState.blank
                                    ? colors.textMuted
                                    : colors.primary,
                              },
                            ]}
                          >
                            {currentState.blank
                              ? 'EN BLANCO'
                              : currentResult
                              ? currentResult.isCorrect
                                ? 'CORRECTA'
                                : 'INCORRECTA'
                              : 'CONTESTADA'}
                          </Text>
                        </View>
                      )}

                      {currentState.markedForReview && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                `${colors.primary}18`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  colors.primary,
                              },
                            ]}
                          >
                            REPASAR
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={
                        styles.questionActions
                      }
                    >
                      <TouchableOpacity
                        onPress={() =>
                          toggleReview(
                            questionIndex,
                          )
                        }
                        disabled={
                          finishing
                        }
                        style={[
                          styles.actionButton,
                          {
                            backgroundColor:
                              currentState.markedForReview
                                ? `${colors.primary}18`
                                : colors.background,
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

                      <TouchableOpacity
                        onPress={() =>
                          toggleFavorite(
                            questionIndex,
                          )
                        }
                        disabled={
                          favoriteLoadingIndex !==
                            null ||
                          loadingFavorites ||
                          finishing
                        }
                        style={[
                          styles.actionButton,
                          {
                            backgroundColor:
                              currentState.favorite
                                ? `${colors.primary}18`
                                : colors.background,
                            borderColor:
                              currentState.favorite
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                      >
                        {favoriteLoadingIndex ===
                        questionIndex ? (
                          <ActivityIndicator
                            size="small"
                            color={
                              colors.primary
                            }
                          />
                        ) : (
                          <Ionicons
                            name={
                              currentState.favorite
                                ? 'star'
                                : 'star-outline'
                            }
                            size={18}
                            color={
                              currentState.favorite
                                ? colors.primary
                                : colors.textMuted
                            }
                          />
                        )}

                        <Text
                          style={[
                            styles.actionText,
                            {
                              color:
                                currentState.favorite
                                  ? colors.primary
                                  : colors.textMuted,
                            },
                          ]}
                        >
                          Favorito
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
                        colors.background;

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
                              questionIndex,
                              answer.id,
                            )
                          }
                          disabled={
                            submitting ||
                            finishing ||
                            (
                              correctionMode ===
                                'immediate' &&
                              currentState.submitted
                            )
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
                            colors.background,
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

                  {currentState.blank ? (
                    <View
                      style={[
                        styles.blankNotice,
                        {
                          backgroundColor:
                            `${colors.textMuted}10`,
                          borderColor:
                            colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={19}
                        color={
                          colors.textMuted
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

                  {/* ACCIONES DE PREGUNTA */}

                  <View
                    style={[
                      styles.questionFooter,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.questionFooterText,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      {currentState.answered
                        ? currentState.blank
                          ? 'Sin respuesta'
                          : currentResult
                          ? currentResult.isCorrect
                            ? 'Respuesta correcta'
                            : 'Respuesta incorrecta'
                          : 'Respuesta seleccionada'
                        : 'Pendiente de respuesta'}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        markBlank(
                          questionIndex,
                        )
                      }
                      disabled={
                        submitting ||
                        finishing ||
                        (
                          correctionMode ===
                            'immediate' &&
                          currentState.submitted
                        )
                      }
                      style={[
                        styles.blankButton,
                        {
                          backgroundColor:
                            currentState.blank
                              ? `${colors.primary}18`
                              : colors.background,
                          borderColor:
                            currentState.blank
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={17}
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
                  </View>
                </View>
              );
            },
          )}

          {/* RESUMEN FINAL */}

          <View
            style={[
              styles.finalSummary,
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
                styles.finalSummaryTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Resumen del test
            </Text>

            <View
              style={
                styles.finalSummaryStats
              }
            >
              <View
                style={
                  styles.finalSummaryStat
                }
              >
                <Text
                  style={[
                    styles.finalSummaryNumber,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {answeredCount}
                </Text>

                <Text
                  style={[
                    styles.finalSummaryLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Contestadas
                </Text>
              </View>

              <View
                style={
                  styles.finalSummaryStat
                }
              >
                <Text
                  style={[
                    styles.finalSummaryNumber,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {remainingCount}
                </Text>

                <Text
                  style={[
                    styles.finalSummaryLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Pendientes
                </Text>
              </View>

              <View
                style={
                  styles.finalSummaryStat
                }
              >
                <Text
                  style={[
                    styles.finalSummaryNumber,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {reviewCount}
                </Text>

                <Text
                  style={[
                    styles.finalSummaryLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Para repasar
                </Text>
              </View>

              <View
                style={
                  styles.finalSummaryStat
                }
              >
                <Text
                  style={[
                    styles.finalSummaryNumber,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {blankCount}
                </Text>

                <Text
                  style={[
                    styles.finalSummaryLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  En blanco
                </Text>
              </View>
            </View>

            {remainingCount > 0 && (
              <Text
                style={[
                  styles.finalSummaryHint,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Las preguntas pendientes se
                considerarán en blanco al
                finalizar el test.
              </Text>
            )}

            <TouchableOpacity
              onPress={() =>
                void doFinish()
              }
              disabled={
                finishing ||
                submitting
              }
              activeOpacity={0.85}
              style={[
                styles.finishButton,
                {
                  backgroundColor:
                    colors.primary,
                  opacity:
                    finishing ||
                    submitting
                      ? 0.55
                      : 1,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={
                  colors.primaryText
                }
              />

              <Text
                style={[
                  styles.finishButtonText,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
              >
                TERMINAR TEST
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

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

  counterBadge: {
    minWidth: 48,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterBadgeText: {
    fontSize: 10,
    fontWeight: '900',
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
    alignItems: 'center',
  },

  questionsContent: {
    width: '100%',
    padding: 16,
    paddingBottom: 45,
  },

  questionsContentDesktop: {
    maxWidth: 950,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 55,
  },

  questionCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },

  questionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  questionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  questionBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  questionActions: {
    flexDirection: 'row',
    gap: 6,
  },

  actionButton: {
    minHeight: 36,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  actionText: {
    fontSize: 10,
    fontWeight: '800',
  },

  statement: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 27,
    marginBottom: 19,
  },

  answer: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 9,
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
    marginTop: 10,
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
    marginTop: 10,
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

  questionFooter: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  questionFooterText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
  },

  blankButton: {
    minHeight: 38,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  blankButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },

  finalSummary: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 3,
  },

  finalSummaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },

  finalSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  finalSummaryStat: {
    flex: 1,
    alignItems: 'center',
  },

  finalSummaryNumber: {
    fontSize: 20,
    fontWeight: '900',
  },

  finalSummaryLabel: {
    marginTop: 4,
    fontSize: 9,
    textAlign: 'center',
  },

  finalSummaryHint: {
    marginTop: 15,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },

  finishButton: {
    minHeight: 56,
    borderRadius: 15,
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  finishButtonText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
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
