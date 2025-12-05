import { vocab } from "@/constants/questions";
import { Audio } from 'expo-av';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function GameScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [gameSessionId, setGameSessionId] = useState<string>(''); // Track game session

  interface Question {
    word: string;
    translation: string;
    options: string[];
  }

  useEffect(() => {
    // Generate a unique session ID when game starts
    const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setGameSessionId(sessionId);

    async function prepareAudio() {
      try {
        const { sound: correctSound } = await Audio.Sound.createAsync(
          require("../assets/audio/correct.mp3")
        );
        const { sound: wrongSound } = await Audio.Sound.createAsync(
          require("../assets/audio/wrong.mp3")
        );

        setCorrectSound(correctSound);
        setWrongSound(wrongSound);
        setIsAudioLoading(false);
      } catch (error) {
        console.error("Failed to load audio", error);
        setIsAudioLoading(false);
      }
    }

    prepareAudio();
  }, []);

  useEffect(() => {
    const shuffledVocab = [...vocab].sort(() => Math.random() - 0.5);
    const quizQuestions = shuffledVocab.slice(0, 10).map((item) => ({
      ...item,
      options: shuffleOptions([item.translation, ...getIncorrectTranslations(item.translation, shuffledVocab)]),
    }));

    setQuestions(quizQuestions);
  }, []);

  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);

  const getIncorrectTranslations = (correctTranslation: string, allVocab: { word: string; translation: string }[]) => {
    const incorrectTranslations = [];
    const usedIndices = new Set();
    while (incorrectTranslations.length < 2 && incorrectTranslations.length < allVocab.length - 1) {
      const randomIndex = Math.floor(Math.random() * allVocab.length);
      if (allVocab[randomIndex].translation !== correctTranslation && !usedIndices.has(randomIndex)) {
        incorrectTranslations.push(allVocab[randomIndex].translation);
        usedIndices.add(randomIndex);
      }
    }
    if (incorrectTranslations.length < 2) {
      const remaining = 2 - incorrectTranslations.length;
      for (let i = 0; i < allVocab.length && incorrectTranslations.length < 2; i++) {
        if (allVocab[i].translation !== correctTranslation && !incorrectTranslations.includes(allVocab[i].translation)) {
          incorrectTranslations.push(allVocab[i].translation);
        }
      }
    }
    return incorrectTranslations;
  };

  const shuffleOptions = (options: string[]) => {
    return [...options].sort(() => Math.random() - 0.5);
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);

    const isCorrect = answer === questions[currentQuestionIndex].translation;
    if (isCorrect && correctSound) {
      await correctSound.replayAsync();
    }
    else if (!isCorrect && wrongSound) {
      await wrongSound.replayAsync();
    }

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Navigate with session ID for validation
        const finalScore = isCorrect ? score + 1 : score;
        router.replace(`/results?score=${finalScore}&totalQuestions=${questions.length}&session=${gameSessionId}`);
      }
    }, 1000);
  };

  if (questions.length === 0 || isAudioLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {isAudioLoading ? "Loading audio..." : "Loading questions..."}
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {/* Header with Question Number and Score */}
      <View style={styles.header}>
        <View style={styles.questionNumberContainer}>
          <Text style={styles.headerLabel}>Question</Text>
          <Text style={styles.headerValue}>{currentQuestionIndex + 1}/{questions.length}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.headerLabel}>Score</Text>
          <Text style={styles.headerValue}>{score}</Text>
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>Translate this word:</Text>
        <Text style={styles.questionText}>{currentQuestion.word}</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.answerButton,
              selectedAnswer === option &&
                (option === currentQuestion.translation ? styles.correctAnswer : styles.incorrectAnswer),
            ]}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.answerText}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  questionNumberContainer: {
    alignItems: "flex-start",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5e5cf1",
  },
  questionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
  },
  optionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  answerButton: {
    padding: 18,
    backgroundColor: "#5e5cf1",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#5e5cf1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  answerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  correctAnswer: {
    backgroundColor: "#32d659ff",
    shadowColor: "#28a745",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  incorrectAnswer: {
    backgroundColor: "#ec2b3fff",
    shadowColor: "#dc3545",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    color: "#6c757d",
  },
});