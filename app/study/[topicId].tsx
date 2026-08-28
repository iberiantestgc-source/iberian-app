import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getTopicById } from '../../src/constants/topics';
import { useThemeStore } from '../../src/context/themeStore';

export default function TopicSubtopicsScreen() {
  const { topicId } = useLocalSearchParams<{
    topicId: string;
  }>();

  const topic = getTopicById(String(topicId || ''));

  const { width } = useWindowDimensions();

  const isDesktop =
    Platform.OS === 'web' && width >= 900;

  const { colors } = useThemeStore();

  if (!topic) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.missing,
            {
              color: colors.text,
            },
          ]}
        >
          Tema no encontrado
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backLink,
              {
                color: colors.primary,
              },
            ]}
          >
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDesktop
            ? colors.backgroundAlt
            : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          isDesktop &&
            styles.shellDesktop,
          {
            backgroundColor:
              colors.background,
            borderColor:
              colors.border,
          },
        ]}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.back()
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
              numberOfLines={2}
            >
              {topic.name}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Selecciona un subtema
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* SUBTEMAS */}
        {/* ================================================== */}

        <ScrollView
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {topic.subtopics.map(
            (sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.border,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  /*
                   * Abrimos la pantalla de
                   * configuración del test.
                   *
                   * Enviamos:
                   * - topicId
                   * - subtopicId
                   *
                   * Esto permitirá que la pantalla
                   * de configuración sepa desde qué
                   * tema/subtema hemos llegado.
                   */

                  router.push({
                    pathname:
                      '/test/setup',
                    params: {
                      topicId:
                        topic.id,
                      subtopicId:
                        sub.id,
                    },
                  });
                }}
              >
                <View
                  style={
                    styles.textBox
                  }
                >
                  <Text
                    style={[
                      styles.subName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {sub.name}
                  </Text>

                  <Text
                    style={[
                      styles.subMeta,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {sub.questions > 0
                      ? `${sub.questions} preguntas`
                      : 'Disponible para test'}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    colors.textMuted
                  }
                />
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },

  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
  },

  shellDesktop: {
    maxWidth: 720,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },

  textBox: {
    flex: 1,
    marginRight: 8,
  },

  subName: {
    fontSize: 16,
    fontWeight: '700',
  },

  subMeta: {
    marginTop: 4,
    fontSize: 13,
  },

  missing: {
    marginTop: 40,
    textAlign: 'center',
  },

  backLink: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },
});