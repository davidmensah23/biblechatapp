import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { CardStyles } from '../theme/cardStyles';
import { CompletedDeedLog, fetchCompletedDeeds } from '../services/deedsService';

interface DeedsChronicleViewProps {
  onOpenNewDeed?: () => void;
}

export const DeedsChronicleView: React.FC<DeedsChronicleViewProps> = ({ onOpenNewDeed }) => {
  const [logs, setLogs] = useState<CompletedDeedLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<CompletedDeedLog | null>(null);

  useEffect(() => {
    loadDeeds();
  }, []);

  const loadDeeds = async () => {
    const data = await fetchCompletedDeeds();
    if (data.length > 0) {
      setLogs(data);
      setSelectedLog(data[0]);
    } else {
      // Sample seed logs for instant visual preview
      const sampleLogs: CompletedDeedLog[] = [
        {
          id: 'seed_log_1',
          deedId: 'seed_encouragement_01',
          title: 'A Word in Season to the Weary',
          reflection: 'I called my old friend Emmanuel, encouraged him through his job search, and prayed over his family.',
          locationName: 'Airport Hills, Accra',
          scriptureRef: '1 Thessalonians 5:11',
          xpAwarded: 50,
          completedAt: Date.now() - 1000 * 60 * 60 * 4
        },
        {
          id: 'seed_log_2',
          deedId: 'branch_table_fellowship_01',
          title: 'Breaking Bread in Kindness',
          reflection: 'Bought hot meals for two street security guards and sat to listen to their stories for 10 minutes.',
          locationName: 'Osu, Accra',
          scriptureRef: 'Hebrews 13:16',
          xpAwarded: 65,
          completedAt: Date.now() - 1000 * 60 * 60 * 28
        },
        {
          id: 'seed_log_3',
          deedId: 'seed_secret_generosity_02',
          title: 'The Hidden Cup of Grace',
          reflection: 'Secretly topped up prepaid electricity for my elderly neighbor without letting anyone know.',
          locationName: 'Tema, Greater Accra',
          scriptureRef: 'Matthew 6:3-4',
          xpAwarded: 50,
          completedAt: Date.now() - 1000 * 60 * 60 * 72
        }
      ];
      setLogs(sampleLogs);
      setSelectedLog(sampleLogs[0]);
    }
  };

  const totalXP = logs.reduce((acc, curr) => acc + curr.xpAwarded, 0);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Metric Header Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryEyebrow}>FAITH IN ACTION</Text>
            <Text style={styles.summaryTitle}>Acts of Grace Chronicle</Text>
          </View>
          <View style={styles.trophyCircle}>
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{logs.length}</Text>
            <Text style={styles.statLabel}>Deeds Sealed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>+{totalXP}</Text>
            <Text style={styles.statLabel}>Grace XP Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Weekly Goal</Text>
          </View>
        </View>
      </View>

      {/* 2. Strava-Style Animated Footsteps of Grace Route */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderLeft}>
            <Ionicons name="navigate-circle" size={20} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.mapHeaderTitle}>Weekly Footsteps of Grace Route</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveText}>STRAVA PATH</Text>
          </View>
        </View>

        {/* Illuminated Parchment Path Visualization */}
        <View style={styles.routeParchment}>
          <View style={styles.routeTrackLine} />

          {logs.slice(0, 4).map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.waypointRow,
                selectedLog?.id === item.id && styles.waypointRowActive
              ]}
              onPress={() => setSelectedLog(item)}
              activeOpacity={0.8}
            >
              {/* Waypoint Marker */}
              <View style={[styles.waypointDot, selectedLog?.id === item.id && styles.waypointDotActive]}>
                <Ionicons
                  name={idx === 0 ? 'location' : 'checkmark-circle'}
                  size={14}
                  color="#FFFFFF"
                />
              </View>

              {/* Waypoint Details */}
              <View style={styles.waypointDetails}>
                <View style={styles.waypointTopRow}>
                  <Text style={styles.waypointLocation}>{item.locationName}</Text>
                  <Text style={styles.waypointTime}>
                    {new Date(item.completedAt).toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                </View>
                <Text style={styles.waypointTaskTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. Selected Deed Replay Card */}
      {selectedLog && (
        <View style={styles.replayCard}>
          <View style={styles.replayTopRow}>
            <View style={styles.replayPill}>
              <Ionicons name="calendar-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.replayPillText}>
                {new Date(selectedLog.completedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.xpPillMini}>
              <Text style={styles.xpPillMiniText}>+{selectedLog.xpAwarded} XP</Text>
            </View>
          </View>

          <Text style={styles.replayTitle}>{selectedLog.title}</Text>

          <View style={styles.reflectionQuoteBox}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color="#6B7280" style={{ marginBottom: 4 }} />
            <Text style={styles.reflectionQuoteText}>"{selectedLog.reflection}"</Text>
          </View>

          <View style={styles.scriptureFooterRow}>
            <Ionicons name="bookmark-outline" size={14} color="#059669" style={{ marginRight: 5 }} />
            <Text style={styles.scriptureFooterText}>{selectedLog.scriptureRef}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    ...CardStyles.smoothCard,
    padding: 20,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryEyebrow: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 2,
  },
  summaryTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: '#111827',
  },
  trophyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  statGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111827',
  },
  statLabel: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  mapCard: {
    ...CardStyles.heroCard,
    padding: 20,
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapHeaderTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  liveText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 9.5,
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  routeParchment: {
    position: 'relative',
    gap: 12,
  },
  routeTrackLine: {
    position: 'absolute',
    left: 14,
    top: 14,
    bottom: 14,
    width: 2.5,
    backgroundColor: '#DBEAFE',
    zIndex: 1,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 2,
  },
  waypointRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  waypointDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  waypointDotActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  waypointDetails: {
    flex: 1,
  },
  waypointTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waypointLocation: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
  },
  waypointTime: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  waypointTaskTitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  replayCard: {
    ...CardStyles.smoothCard,
    padding: 20,
    marginBottom: 20,
  },
  replayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  replayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replayPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#1E40AF',
  },
  xpPillMini: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpPillMiniText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    color: '#B45309',
  },
  replayTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 19,
    color: '#111827',
    marginBottom: 10,
  },
  reflectionQuoteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  reflectionQuoteText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  scriptureFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scriptureFooterText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#059669',
  }
});
