import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../../services/api';
import BackButton from '../../components/BackButton';

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  points: number;
}

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://98.92.69.158:5000/leaderboard');
        const data = await response.json();

        if (response.ok && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        } else {
          console.error('Failed to fetch leaderboard:', data.error);
        }
      } catch (error) {
        console.error('Leaderboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 Back Button */}
      <BackButton mode="arrow" />

      <Text style={styles.title}>🏆 Leaderboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView style={styles.scroll}>
          {leaderboard.map((user) => (
            <View key={user.rank} style={styles.card}>
              <Text style={styles.rank}>#{user.rank}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
              <Text style={styles.points}>{user.points} pts</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginVertical: 20,
  },
  scroll: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rank: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3b82f6',
    width: 50,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  points: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
});