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
             pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
           ]}
           onPress={() => router.push("/game")}
         >
           <Text style={[styles.buttonText, styles.regular]}>Start Quiz</Text>
          </Pressable>

          <Pressable
           style={({ pressed }) => [
             styles.button,
             pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
           ]}
           onPress={() => router.push("/scoreHistory")} // Navigate to score history
         >
           <Text style={[styles.buttonText, styles.regular]}>View Score History</Text>
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
    width: 250,
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#5e5cf1ff",
    borderRadius: 10,
        boxShadow: '0 4px 8px rgba(94,92,241,0.3)',
    elevation: 2,

  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
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
