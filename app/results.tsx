import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ResultsScreen() {
  const router = useRouter();
  const { score, totalQuestions, session } = useLocalSearchParams();
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Handle the string | string[] type by converting to string first
  const scoreStr = Array.isArray(score) ? score[0] : score;
  const totalStr = Array.isArray(totalQuestions) ? totalQuestions[0] : totalQuestions;
  const sessionStr = Array.isArray(session) ? session[0] : session;

  // Validate inputs
  const finalScore = scoreStr && !isNaN(parseInt(scoreStr)) ? parseInt(scoreStr) : null;
  const total = totalStr && !isNaN(parseInt(totalStr)) ? parseInt(totalStr) : null;

  useEffect(() => {
    const validateAccess = async () => {
      // Check if all required parameters are present and valid
      if (!sessionStr || !sessionStr.startsWith('game_')) {
        console.log("Invalid or missing session");
        setIsChecking(false);
        setIsValidAccess(false);
        return;
      }

      if (finalScore === null || total === null || total <= 0) {
        console.log("Invalid score or total questions");
        setIsChecking(false);
        setIsValidAccess(false);
        return;
      }

      if (finalScore < 0 || finalScore > total) {
        console.log("Score out of valid range");
        setIsChecking(false);
        setIsValidAccess(false);
        return;
      }

      // Check if this session was already used
      try {
        const usedSessionsStr = await AsyncStorage.getItem('usedSessions');
        const usedSessions = usedSessionsStr ? JSON.parse(usedSessionsStr) : [];
        
        if (usedSessions.includes(sessionStr)) {
          console.log("Session already used");
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // Mark session as used
        usedSessions.push(sessionStr);
        await AsyncStorage.setItem('usedSessions', JSON.stringify(usedSessions));

        // Clean up old sessions (keep only last 50)
        if (usedSessions.length > 50) {
          const recentSessions = usedSessions.slice(-50);
          await AsyncStorage.setItem('usedSessions', JSON.stringify(recentSessions));
        }

        // All validation passed
        setIsValidAccess(true);
        setIsChecking(false);

        // Save the score
        await saveScore();
      } catch (e) {
        console.error("Validation error", e);
        setIsChecking(false);
        setIsValidAccess(false);
      }
    };

    validateAccess();
  }, [sessionStr, finalScore, total]);

  const saveScore = async () => {
    try {
      if (finalScore === null || total === null) return;

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

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Validating...</Text>
      </View>
    );
  }

  // Redirect if invalid access
  if (!isValidAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>⚠️ Invalid Access</Text>
          <Text style={styles.errorText}>
            You can only view results after completing a quiz.
          </Text>
          <Pressable 
            style={styles.button} 
            onPress={() => router.replace("/")}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Show results for valid access
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
    color: "#212529",
  },
  scoreText: {
    fontSize: 24,
    marginBottom: 30,
    color: "#495057",
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
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    color: "#6c757d",
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#dc3545",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#6c757d",
    lineHeight: 24,
  },
});