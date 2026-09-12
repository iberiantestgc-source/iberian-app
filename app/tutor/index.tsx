import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { askTutor } from '../../src/api/ai';
import { useThemeStore } from '../../src/context/themeStore';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  mode?: string;
}

export default function TutorScreen() {
  const { colors, mode, toggleMode } = useThemeStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Soy tu tutor de oposiciones. Pregúntame sobre leyes, artículos o conceptos. Si tienes Premium, usaré IA real; si no, te indicaré el límite.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();

    if (!q || loading) {
      return;
    }

    setInput('');

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: q,
      },
    ]);

    setLoading(true);

    try {
      const res = await askTutor({
        question: q,
      });

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: res.answer,
          mode: res.mode,
        },
      ]);
    } catch (e: any) {
      const raw =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo obtener respuesta del tutor';

      const text = Array.isArray(raw) ? raw.join('\n') : String(raw);

      const isTimeout =
        e?.code === 'ECONNABORTED' ||
        text.toLowerCase().includes('timeout');

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: isTimeout
            ? '⚠️ El servidor tardó demasiado (a veces está despertando). Espera unos segundos y vuelve a enviar la pregunta.'
            : `⚠️ ${text}`,
        },
      ]);

      if (e?.response?.status === 403) {
        Alert.alert(
          'Premium requerido',
          'El tutor IA está disponible solo en el plan Premium.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: `${colors.primary}18`,
              },
            ]}
          >
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Tutor IA
          </Text>
        </View>

        {/* ================================================== */}
        {/* CAMBIO DÍA / NOCHE */}
        {/* ================================================== */}

        <TouchableOpacity
          onPress={toggleMode}
          style={[
            styles.themeBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'night'
              ? 'Cambiar a modo día'
              : 'Cambiar a modo noche'
          }
        >
          <Ionicons
            name={mode === 'night' ? 'sunny-outline' : 'moon-outline'}
            size={21}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* CHAT */}
      {/* ====================================================== */}

      <ScrollView
        ref={scrollRef}
        style={[
          styles.chat,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((m, i) => {
          const isUser = m.role === 'user';

          return (
            <View
              key={i}
              style={[
                styles.messageWrapper,
                isUser
                  ? styles.messageWrapperUser
                  : styles.messageWrapperAssistant,
              ]}
            >
              {!isUser && (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: `${colors.primary}18`,
                    },
                  ]}
                >
                  <Ionicons
                    name="sparkles"
                    size={15}
                    color={colors.primary}
                  />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [
                        styles.bubbleUser,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]
                    : [
                        styles.bubbleAssistant,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    {
                      color: isUser
                        ? colors.primaryText
                        : colors.text,
                    },
                  ]}
                >
                  {m.text}
                </Text>

                {m.mode === 'mock' && (
                  <Text
                    style={[
                      styles.modeTag,
                      {
                        color: colors.primary,
                      },
                    ]}
                  >
                    modo desarrollo
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}

        {loading && (
          <View
            style={[
              styles.messageWrapper,
              styles.messageWrapperAssistant,
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: `${colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={15}
                color={colors.primary}
              />
            </View>

            <View
              style={[
                styles.bubble,
                styles.bubbleAssistant,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} size="small" />

                <Text
                  style={[
                    styles.loadingText,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  El tutor está pensando (puede tardar hasta 1 min)...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ====================================================== */}
      {/* INPUT */}
      {/* ====================================================== */}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
              },
            ]}
            placeholder="Escribe tu duda..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            textAlignVertical="center"
            editable={!loading}
            onSubmitEditing={() => {
              if (Platform.OS !== 'web') {
                void send();
              }
            }}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.primary,
              },
              (!input.trim() || loading) && styles.sendDisabled,
            ]}
            onPress={send}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={19}
              color={colors.primaryText}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.inputHint,
            {
              color: colors.textMuted,
            },
          ]}
        >
          Tutor IA · {input.length}/2000
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ========================================================= */
  /* HEADER */
  /* ========================================================= */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* ========================================================= */
  /* CHAT */
  /* ========================================================= */

  chat: {
    flex: 1,
  },

  chatContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },

  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '92%',
  },

  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },

  messageWrapperAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
    marginTop: 2,
  },

  bubble: {
    maxWidth: '88%',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  bubbleUser: {
    borderBottomRightRadius: 5,
  },

  bubbleAssistant: {
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },

  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },

  modeTag: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '700',
  },

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexShrink: 1,
  },

  loadingText: {
    fontSize: 13,
    flexShrink: 1,
  },

  /* ========================================================= */
  /* INPUT */
  /* ========================================================= */

  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    borderTopWidth: 1,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 17,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 56,
  },

  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },

  sendBtn: {
    width: 43,
    height: 43,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendDisabled: {
    opacity: 0.4,
  },

  inputHint: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
});