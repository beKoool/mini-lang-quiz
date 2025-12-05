import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/StyledText";

export default function HomeScreen() {
  const router = useRouter(); 
  return (
    
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        
        {/* Logo */}
        <Image 
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Body */}
      <View style={styles.body}>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.8 }
            ]}
            onPress={() => router.push("/game")}
          >
            <Text style={styles.buttonText}>Start Quiz</Text>
            <Text style={styles.buttonIcon}>🎯</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.8 }
            ]}
            onPress={() => router.push("/scoreHistory")}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>View Score History</Text>
            <Text style={styles.buttonIcon}>📊</Text>
          </Pressable>


      </View>
      <View style={styles.footer}>
        <Text style={styles.creditsText}>Made by Anuj Sapkota</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 100,
    alignItems: "center",
    elevation: 3,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 300, 
    marginBottom: 100,
  },
    button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    paddingHorizontal: 24,  
    marginVertical: 6,
    borderRadius: 12,
    position: "relative",
  },

  primaryButton: {
    backgroundColor: "#5e5cf1",
    shadowColor: 'rgba(94,92,241,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#495057",
  },
   buttonIcon: {
    fontSize: 20,
    position: "absolute",
    right: 20,
  },
  regular: {
    fontFamily: "Inter_400Regular",
  },
    footer: {
    paddingBottom: 30,
    alignItems: "center",
  },
  creditsText: {
    fontSize: 14,
    color: "#6c757d",
    fontFamily: "Inter_400Regular",
  },
});
