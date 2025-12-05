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
         setScores(parsedScores);
       } catch (e) {
         console.error("Failed to load scores", e);
         // Handle the error (e.g., show an alert)
       }
     };
     loadScores();
   }, []); // Load scores on component mount

   const formatDate = (isoString: string) => {
     const date = new Date(isoString);
     return date.toLocaleDateString() + " " + date.toLocaleTimeString();
   };


   return (
     <View style={styles.container}>
       <Text style={styles.title}>Score History</Text>
       {scores.length === 0 ? (
         <Text style={styles.noScoresText}>No scores yet. Play a quiz!</Text>
       ) : (
         <FlatList
           data={scores}
           keyExtractor={(item, index) => index.toString()}
           renderItem={({ item }) => (
             <View style={styles.scoreItem}>
               <Text style={styles.scoreText}>
                 Score: {item.score} / {item.totalQuestions}
               </Text>
               <Text style={styles.dateText}>
                 {formatDate(item.timestamp)}
               </Text>
             </View>
           )}
         />
         
       )}

       <Pressable onPress={() => router.back()} 
             style={({ pressed }) => [
             styles.backButton,
             pressed && { transform: [{ scale: 0.95 }], opacity: 0.6 }
           ]}>
         <Text style={styles.backButtonText}>Go Back</Text>
       </Pressable>
     </View>
   );
 }

 const styles = StyleSheet.create({
   container: {
     flex: 1,
     padding: 20,
     backgroundColor: '#f8f9fa',
   },
   title: {
     fontSize: 24,
     fontWeight: 'bold',
     marginBottom: 20,
   },
   noScoresText: {
     fontSize: 16,
     textAlign: 'center',
     marginTop: 20,
   },
   scoreItem: {
     backgroundColor: '#fff',
     padding: 15,
     borderRadius: 8,
     marginBottom: 10,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
   },
   scoreText: {
     fontSize: 18,
     fontWeight: '500',
   },
   dateText: {
     fontSize: 14,
     color: '#6c757d',
   },
   backButton: {
     backgroundColor: '#5e5cf1',
     padding: 15,
     borderRadius: 10,
     alignItems: 'center',
     marginTop: 20,
   },
   backButtonText: {
     color: '#fff',
     fontSize: 18,
     fontWeight: 'bold',
   },
 });
