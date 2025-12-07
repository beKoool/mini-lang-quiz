import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function ScoreHistoryScreen() {
  const [scores, setScores] = useState<
    { score: number; totalQuestions: number; timestamp: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const loadScores = async () => {
      try {
        const scoresString = await AsyncStorage.getItem('scores');
        const parsedScores = scoresString ? JSON.parse(scoresString) : [];
        // Reverse to show newest first
        setScores(parsedScores.reverse());
      } catch (e) {
        console.error("Failed to load scores", e);
      }
    };
    loadScores();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time for recent scores
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 60) return '#ffc107'; // Yellow
    if (percentage >= 40) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage === 100) return '🏆';
    if (percentage >= 90) return '💪';
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '😊';
    if (percentage >= 40) return '😐';
    return '😢';
  };

  return (
    <View style={styles.container}>
      {/* Score List */}
      {scores.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No Quizzes Yet</Text>
          <Text style={styles.emptyText}>
            Start your first quiz to see your scores here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const percentage = (item.score / item.totalQuestions) * 100;
            return (
              <View style={styles.scoreItem}>
                <View style={styles.scoreHeader}>
                  <View style={styles.scoreLeft}>
                    <Text style={styles.emojiText}>
                      {getScoreEmoji(percentage)}
                    </Text>
                    <View>
                      <Text style={[styles.scoreText, { color: getScoreColor(percentage) }]}>
                        {item.score} / {item.totalQuestions}
                      </Text>
                      <Text style={styles.dateText}>
                        {formatDate(item.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Pressable 
        onPress={() => router.replace("/")} 
        style={({ pressed }) => [
          styles.backButton,
          pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
        ]}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiText: {
    fontSize: 32,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#6c757d',
  },
  backButton: {
    backgroundColor: '#5e5cf1',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 60,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});