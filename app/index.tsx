import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./StyledText";

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
      fontFamily: 'Inter_400Regular',
  },
  header: {
    paddingTop: 60,
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
    marginBottom: 80,
  },
  button: {
    width: 250,
    padding: 15,
    marginVertical: 15,
    backgroundColor: "#5e5cf1ff",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  regular: {
    fontFamily: "Inter_400Regular",
  },
 
});
