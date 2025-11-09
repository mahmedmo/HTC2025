import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../../services/api';
import BackButton from '../../components/BackButton';
import { Ionicons } from '@expo/vector-icons';

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

  const getMaxPoints = () => {
    if (leaderboard.length === 0) return 100;
    return Math.max(...leaderboard.map(u => u.points));
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return '#fbbf24'; // Gold
    if (rank === 2) return '#94a3b8'; // Silver
    if (rank === 3) return '#fb923c'; // Bronze
    return '#8b5cf6'; // Purple for others
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <View style={styles.background}>
      {/* Decorative background elements */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
      <View style={styles.floatingCircle1} />
      <View style={styles.floatingCircle2} />
      <View style={styles.floatingCircle3} />
      <View style={styles.floatingCircle4} />
      <View style={styles.accentShape1} />
      <View style={styles.accentShape2} />
      
      {/* Decorative dots */}
      <View style={styles.dot1} />
      <View style={styles.dot2} />
      <View style={styles.dot3} />
      <View style={styles.dot4} />
      <View style={styles.dot5} />
      
      <SafeAreaView style={styles.container}>
        <BackButton mode="arrow" />

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Top Performers</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView 
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {leaderboard.map((user, index) => {
              const maxPoints = getMaxPoints();
              const barWidth = maxPoints > 0 ? (user.points / maxPoints) * 100 : 0;
              const isTopThree = user.rank <= 3;
              
              return (
                <View 
                  key={user.rank} 
                  style={[
                    styles.card,
                    isTopThree && styles.topThreeCard
                  ]}
                >
                  {/* Shimmer effect */}
                  <View style={styles.cardShimmer} />
                  
                  {/* Rank Badge */}
                  <View style={[
                    styles.rankBadge,
                    { backgroundColor: getRankBadgeColor(user.rank) }
                  ]}>
                    <Text style={styles.rankEmoji}>{getRankEmoji(user.rank)}</Text>
                    <Text style={styles.rankText}>#{user.rank}</Text>
                  </View>

                  {/* User Info */}
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{user.name}</Text>
                      {isTopThree && (
                        <Ionicons name="star" size={16} color={getRankBadgeColor(user.rank)} />
                      )}
                    </View>
                    <Text style={styles.email}>{user.email}</Text>
                    
                    {/* Points Bar */}
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.barFill,
                          { 
                            width: `${barWidth}%`,
                            backgroundColor: getRankBadgeColor(user.rank)
                          }
                        ]}
                      >
                        <View style={styles.barShine} />
                      </View>
                    </View>
                  </View>

                  {/* Points Display */}
                  <View style={styles.pointsContainer}>
                    <Ionicons name="trophy" size={20} color="#fbbf24" />
                    <Text style={styles.points}>{user.points}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  gradientTop: {
    position: 'absolute',
    top: -80,
    left: -80,
    right: -80,
    height: 350,
    backgroundColor: '#1e40af',
    opacity: 0.12,
    borderRadius: 175,
    transform: [{ scaleX: 1.5 }],
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    right: -80,
    height: 400,
    backgroundColor: '#059669',
    opacity: 0.1,
    borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  floatingCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8b5cf6',
    opacity: 0.06,
    top: 100,
    right: -60,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#10b981',
    opacity: 0.08,
    top: 200,
    left: -40,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fbbf24',
    opacity: 0.07,
    bottom: 300,
    right: 30,
  },
  floatingCircle4: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#3b82f6',
    opacity: 0.06,
    bottom: -50,
    left: -50,
  },
  accentShape1: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#ec4899',
    opacity: 0.04,
    top: -80,
    left: -80,
    borderRadius: 125,
    transform: [{ rotate: '45deg' }],
  },
  accentShape2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#06b6d4',
    opacity: 0.05,
    bottom: -60,
    right: -60,
    borderRadius: 100,
    transform: [{ rotate: '-30deg' }],
  },
  dot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa',
    opacity: 0.5,
    top: 150,
    left: 60,
  },
  dot2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    opacity: 0.6,
    top: 250,
    right: 80,
  },
  dot3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    opacity: 0.4,
    bottom: 350,
    left: 40,
  },
  dot4: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#60a5fa',
    opacity: 0.5,
    bottom: 200,
    right: 50,
  },
  dot5: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#f472b6',
    opacity: 0.4,
    top: 400,
    right: 120,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  headerIconContainer: {
    marginBottom: 12,
  },
  trophyIcon: {
    fontSize: 60,
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  topThreeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.4,
  },
  cardShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  rankBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  rankEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
    minWidth: 8,
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  pointsContainer: {
    alignItems: 'center',
    gap: 2,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(251, 191, 36, 0.3)',
  },
  points: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(251, 191, 36, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
});