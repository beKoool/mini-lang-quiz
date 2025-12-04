import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function GameScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Screen</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    },
    title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    },
    button: {
    padding: 15,
    backgroundColor: "#5e5cf1ff",
    borderRadius: 10,
    },
    buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    },
});

