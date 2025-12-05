import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function ResultsScreen() {
  const router = useRouter();
  const { score, totalQuestions } = useLocalSearchParams();

  // Handle the string | string[] type by converting to string first
  const finalScore = score ? parseInt(Array.isArray(score) ? score[0] : score) : 0;
  const total = totalQuestions ? parseInt(Array.isArray(totalQuestions) ? totalQuestions[0] : totalQuestions) : 0;

  useEffect(() => {
    const saveScore = async () => {
      try {
        const timestamp = new Date().toISOString();
        const scoreData = { score: finalScore, totalQuestions: total, timestamp };
        const existingScoresString = await AsyncStorage.getItem('scores');
        let existingScores = existingScoresString ? JSON.parse(existingScoresString) : [];
        existingScores.push(scoreData);
        await AsyncStorage.setItem('scores', JSON.stringify(existingScores));
      } catch (e) {
        console.error("Failed to save score", e);
      }
    };

    if (total > 0) {
      saveScore();
    }

  }, [finalScore, total]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.scoreText}>
        Your Score: {finalScore} / {total}
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => router.replace("/game")}>
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: "#5e5cf1",
    padding: 15,
    borderRadius: 10,
    width: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});