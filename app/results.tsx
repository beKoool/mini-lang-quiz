import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/StyledText";


export default function ResultsScreen() {
  const router = useRouter();
  const { score, totalQuestions, session } = useLocalSearchParams();
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Handle the string | string[] type by converting to string first
  const scoreStr = Array.isArray(score) ? score[0] : score;
  const totalStr = Array.isArray(totalQuestions) ? totalQuestions[0] : totalQuestions;
  const sessionStr = Array.isArray(session) ? session[0] : session;

  // Parse inputs
  const urlScore = scoreStr && !isNaN(parseInt(scoreStr)) ? parseInt(scoreStr) : null;
  const urlTotal = totalStr && !isNaN(parseInt(totalStr)) ? parseInt(totalStr) : null;

  useEffect(() => {
    const validateAccess = async () => {
      // Check if session exists
      if (!sessionStr) {
        console.log("Missing session");
        setIsChecking(false);
        setIsValidAccess(false);
        return;
      }

      try {
        // Get the pending sessions
        const pendingSessionsStr = await AsyncStorage.getItem('pendingSessions');
        const pendingSessions = pendingSessionsStr ? JSON.parse(pendingSessionsStr) : {};
        
        // Check if this session exists in our pending sessions
        const sessionData = pendingSessions[sessionStr];
        
        if (!sessionData) {
          console.log("Session not found - invalid or fabricated session");
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // Check if session was already used
        if (sessionData.used) {
          console.log("Session already used");
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // Check if session is completed
        if (!sessionData.completed) {
          console.log("Game not completed yet");
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // Verify the score and total match what was stored during the game
        const storedScore = sessionData.score;
        const storedTotal = sessionData.totalQuestions;

        if (urlScore !== storedScore || urlTotal !== storedTotal) {
          console.log("Score/total mismatch - URL has been tampered with");
          console.log(`Expected: ${storedScore}/${storedTotal}, Got: ${urlScore}/${urlTotal}`);
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // Check if session is too old (expired after 5 minutes)
        const sessionAge = Date.now() - sessionData.timestamp;
        const fiveMinutes = 5 * 60 * 1000;
        if (sessionAge > fiveMinutes) {
          console.log("Session expired");
          setIsChecking(false);
          setIsValidAccess(false);
          return;
        }

        // All validation passed - mark session as used
        sessionData.used = true;
        pendingSessions[sessionStr] = sessionData;
        await AsyncStorage.setItem('pendingSessions', JSON.stringify(pendingSessions));

        // Clean up old sessions (keep only last 20)
        const sessions = Object.entries(pendingSessions);
        if (sessions.length > 20) {
          const recentSessions = sessions
            .sort(([, a]: any, [, b]: any) => b.timestamp - a.timestamp)
            .slice(0, 20);
          await AsyncStorage.setItem('pendingSessions', JSON.stringify(Object.fromEntries(recentSessions)));
        }

        // Save the score to history
        await saveScore(storedScore, storedTotal);
        
        setIsValidAccess(true);
        setIsChecking(false);
      } catch (e) {
        console.error("Validation error", e);
        setIsChecking(false);
        setIsValidAccess(false);
      }
    };

    validateAccess();
  }, [sessionStr, urlScore, urlTotal]);

  const saveScore = async (validScore: number, validTotal: number) => {
    try {
      const timestamp = new Date().toISOString();
      const scoreData = { score: validScore, totalQuestions: validTotal, timestamp };
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
          <Text style={styles.errorSubText}>
            Please don't tamper with the URL.
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

  // Show results for valid access (use the stored score, not URL params)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.scoreText}>
        Your Score: {urlScore} / {urlTotal}
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
    // fontWeight: "bold",
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    marginBottom: 12,
    color: "#6c757d",
    lineHeight: 24,
  },
  errorSubText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    color: "#adb5bd",
    fontStyle: "italic",
  },
});