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
import { router } from 'expo-router';
import { TOPICS } from '../../src/constants/topics';
import { useThemeStore } from '../../src/context/themeStore';

export default function StudyScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const { colors } = useThemeStore();

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
          isDesktop && styles.shellDesktop,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            isDesktop && styles.headerDesktop,
          ]}
        >
          <Text
            style={[
              styles.title,
              isDesktop && styles.titleDesktop,
              { color: colors.text },
            ]}
          >
            Temario
          </Text>

          <Text
            style={[
              styles.subtitle,
              isDesktop && styles.subtitleDesktop,
              { color: colors.textMuted },
            ]}
          >
            Selecciona una materia para comenzar a estudiar
          </Text>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            isDesktop && styles.listContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.grid,
              isDesktop && styles.gridDesktop,
            ]}
          >
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.row,
                  isDesktop && styles.rowDesktop,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => router.push(`/study/${topic.id}`)}
              >
                <View
                  style={[
                    styles.iconBox,
                    isDesktop && styles.iconBoxDesktop,
                    { backgroundColor: `${topic.color}22` },
                  ]}
                >
                  <Ionicons
                    name={topic.icon}
                    size={isDesktop ? 25 : 22}
                    color={topic.color}
                  />
                </View>

                <View style={styles.textBox}>
                  <Text
                    style={[
                      styles.topicName,
                      isDesktop && styles.topicNameDesktop,
                      { color: colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {topic.name}
                  </Text>

                  <Text
                    style={[
                      styles.topicMeta,
                      isDesktop && styles.topicMetaDesktop,
                      { color: colors.textMuted },
                    ]}
                  >
                    {topic.questions > 0
                      ? `${topic.questions} preguntas`
                      : `${topic.subtopics.length} subtemas`}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={isDesktop ? 22 : 20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
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
    width: '94%',
    maxWidth: 1180,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 20,
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerDesktop: {
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
  },

  titleDesktop: {
    fontSize: 32,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  subtitleDesktop: {
    fontSize: 15,
    marginTop: 6,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },

  listContentDesktop: {
    paddingHorizontal: 32,
    paddingBottom: 36,
  },

  grid: {
    width: '100%',
    gap: 10,
  },

  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  rowDesktop: {
    width: '48.8%',
    minHeight: 82,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBoxDesktop: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },

  textBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  topicName: {
    fontSize: 15,
    fontWeight: '700',
  },

  topicNameDesktop: {
    fontSize: 16,
  },

  topicMeta: {
    marginTop: 3,
    fontSize: 12,
  },

  topicMetaDesktop: {
    marginTop: 5,
    fontSize: 13,
  },
});