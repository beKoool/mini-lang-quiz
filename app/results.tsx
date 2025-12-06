import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/StyledText";

export default function ResultsScreen() {
    const router = useRouter();
    const { score, totalQuestions, session } = useLocalSearchParams();
    const [isValidAccess, setIsValidAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [animationScale] = useState(new Animated.Value(0));
    const [animationFade] = useState(new Animated.Value(0));

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

    useEffect(() => {
        // Animation to show when the results are valid
        if (isValidAccess) {
            Animated.parallel([
                Animated.spring(animationScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(animationFade, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isValidAccess, animationScale, animationFade]);

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

    const getScoreEmoji = (percentage: number) => {
        if (percentage === 100) return '🏆';
        if (percentage >= 90) return '💪';
        if (percentage >= 80) return '🎉';
        if (percentage >= 60) return '😊';
        if (percentage >= 40) return '😐';
        return '😔';
    };

    const getScoreMessage = (percentage: number) => {
        if (percentage === 100) return 'Perfect Score!';
        if (percentage >= 90) return 'Outstanding!';
        if (percentage >= 80) return 'Great Job!';
        if (percentage >= 60) return 'Well Done!';
        if (percentage >= 40) return 'Keep Practicing!';
        return 'Try Again!';
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return '#28a745';
        if (percentage >= 60) return '#ffc107';
        if (percentage >= 40) return '#fd7e14';
        return '#dc3545';
    };

    // Helper function to calculate percentage
    const getPercentage = (score: number | null, total: number | null): number => {
        if (score === null || total === null || total === 0) {
            return 0;
        }
        return (score / total) * 100;
    };

    // Calculate the percentage based on validated scores
    const scorePercentage = urlScore !== null && urlTotal !== null ? getPercentage(urlScore, urlTotal) : 0;

    // Show loading while checking
    if (isChecking) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Validating...</Text>
                </View>
            </View>
        );
    }

    // Redirect if invalid access
    if (!isValidAccess) {
        return (
            <View style={styles.container}>
                <View style={styles.errorCard}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorTitle}>Invalid Access</Text>
                    <Text style={styles.errorText}>
                        You can only view results after completing a quiz.
                    </Text>
                    <Text style={styles.errorSubText}>
                        Please don't tamper with the URL.
                    </Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.errorButton,
                            pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
                        ]}
                        onPress={() => router.replace("/")}
                    >
                        <Text style={styles.errorButtonText}>Go to Home</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // Show results for valid access
    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    opacity: animationFade,
                }
            ]}
        >
            <View style={styles.content}>
                <Animated.View 
                    style={[
                        styles.resultsCard,
                        { transform: [{ scale: animationScale }] }
                    ]}
                >
                    <Text style={styles.resultsTitle}>Quiz Complete!</Text>
                    
                    <Text style={styles.emojiText}>{getScoreEmoji(scorePercentage)}</Text>
                    
                    <Text style={[styles.scoreMessage, { color: getScoreColor(scorePercentage) }]}>
                        {getScoreMessage(scorePercentage)}
                    </Text>
                    
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Your Score</Text>
                        <Text style={[styles.scoreText, { color: getScoreColor(scorePercentage) }]}>
                            {urlScore} / {urlTotal}
                        </Text>
                       
                    </View>
                </Animated.View>

                <View style={styles.buttonContainer}>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.button,
                            styles.primaryButton,
                            pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
                        ]}
                        onPress={() => router.replace("/game")}
                    >
                        <Text style={styles.buttonText}>Play Again</Text>
                    </Pressable>
                    
                    <Pressable 
                        style={({ pressed }) => [
                            styles.button,
                            styles.secondaryButton,
                            pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
                        ]}
                        onPress={() => router.replace("/")}
                    >
                        <Text style={[styles.buttonText,styles.secondaryButtonText]}>Home</Text>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 18,
        color: "#6c757d",
        fontFamily: 'Inter_400Regular',
    },
    resultsCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        elevation: 3,
        marginBottom: 32,
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#212529",
        marginBottom: 24,
        fontFamily: 'Inter_600SemiBold',
    },
    emojiText: {
        fontSize: 80,
        marginBottom: 16,
    },
    scoreMessage: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 24,
        fontFamily: 'Inter_600SemiBold',
    },
    scoreContainer: {
        alignItems: "center",
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        width: "100%",
    },
    scoreLabel: {
        fontSize: 12,
        color: "#6c757d",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        fontFamily: 'Inter_500Medium',
    },
    scoreText: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 4,
        fontFamily: 'Inter_700Bold',
    },
    percentageText: {
        fontSize: 16,
        color: "#6c757d",
        fontFamily: 'Inter_500Medium',
    },
    buttonContainer: {
        width: "100%",
        maxWidth: 400,
        gap: 12,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        width: "100%",
    },
    primaryButton: {
        backgroundColor: "#5e5cf1",
        boxShadow: '0 4px 8px rgba(94,92,241,0.3)',
        elevation: 2,
    },
    secondaryButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#e9ecef",
      },
      secondaryButtonText: {
        color: "#495057",
      },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: 'Inter_600SemiBold',
    },
    errorCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#dc3545",
        fontFamily: 'Inter_700Bold',
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
        color: "#6c757d",
        lineHeight: 24,
        fontFamily: 'Inter_400Regular',
    },
    errorSubText: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 32,
        color: "#adb5bd",
        fontStyle: "italic",
        fontFamily: 'Inter_400Regular',
    },
    errorButton: {
        backgroundColor: "#5e5cf1",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        boxShadow: '0 4px 8px rgba(94,92,241,0.3)',
        elevation: 2,
    },
    errorButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: 'Inter_600SemiBold',
    },
});