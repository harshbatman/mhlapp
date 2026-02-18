import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Learn More</ThemedText>
        <ThemedText style={styles.subtitle}>Discover how MAHTO Home Loans can help you build your future.</ThemedText>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors[colorScheme].tint} />
          <ThemedText style={styles.cardTitle}>Secure Processing</ThemedText>
          <ThemedText style={styles.cardText}>All your data is encrypted and handled with the highest security standards.</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="speedometer" size={32} color={Colors[colorScheme].tint} />
          <ThemedText style={styles.cardTitle}>Fast Approvals</ThemedText>
          <ThemedText style={styles.cardText}>Our streamlined process ensures you get your loan decision faster than traditional methods.</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="people" size={32} color={Colors[colorScheme].tint} />
          <ThemedText style={styles.cardTitle}>Expert Guidance</ThemedText>
          <ThemedText style={styles.cardText}>Our counselors are here to help you choose the best plan for your dream home.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
  },
  infoCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
});
