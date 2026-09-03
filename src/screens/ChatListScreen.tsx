import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchConversations, fetchGroupThreads } from '../services/database';
import { getPersonaById, APOSTLE_PERSONAS } from '../services/personas';
import { ConversationThread, ApostlePersona } from '../types';
import { GroupCouncilThread } from '../types/groupChat';
import { CreateGroupCouncilModal } from '../components/CreateGroupCouncilModal';
import { ChatListSkeleton } from '../components/SoftSkeleton';
import { PastoralGuidesRow } from '../components/PastoralGuidesRow';
import { PastoralGuideModal } from '../components/PastoralGuideModal';
import { PastoralGuide } from '../services/pastoralGuidesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChatListScreenProps {
  onSelectConversation: (apostle: ApostlePersona, initialMessage?: string) => void;
  onSelectGroupCouncil: (thread: GroupCouncilThread) => void;
  onBack: () => void;
  onSetNavBarVisible?: (visible: boolean) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onSelectConversation,
  onSelectGroupCouncil,
  onBack,
  onSetNavBarVisible
}) => {
  const [activeSegment, setActiveSegment] = useState<'apostles' | 'councils'>('apostles');
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [groupThreads, setGroupThreads] = useState<GroupCouncilThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCreateCouncilModal, setShowCreateCouncilModal] = useState(false);
  const [selectedPastoralGuide, setSelectedPastoralGuide] = useState<PastoralGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pagerRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tab indicator slide animation
  const tabIndicatorOffset = useSharedValue(0);
  const SEGMENT_WIDTH = (SCREEN_WIDTH - 32 - 8) / 2;

  useEffect(() => {
    loadData();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (onSetNavBarVisible) onSetNavBarVisible(true);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await fetchConversations();
      const groups = await fetchGroupThreads();
      setConversations(list);
      setGroupThreads(groups);
    } finally {
      setIsLoading(false);
    }
  };

  const switchSegment = (seg: 'apostles' | 'councils') => {
    setActiveSegment(seg);
    tabIndicatorOffset.value = withSpring(seg === 'apostles' ? 0 : SEGMENT_WIDTH + 4, {
      damping: 22,
      stiffness: 260
    });
    pagerRef.current?.scrollTo({
      x: seg === 'apostles' ? 0 : SCREEN_WIDTH,
      animated: true
    });
  };

  const handlePagerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    const newSeg = page === 0 ? 'apostles' : 'councils';
    if (newSeg !== activeSegment) {
      setActiveSegment(newSeg);
      tabIndicatorOffset.value = withSpring(page === 0 ? 0 : SEGMENT_WIDTH + 4, {
        damping: 22,
        stiffness: 260
      });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8 && currentY > 25) {
      // User is scrolling down: hide floating nav bar
      if (onSetNavBarVisible) onSetNavBarVisible(false);

      // Reset auto-restore timer
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        if (onSetNavBarVisible) onSetNavBarVisible(true);
      }, 950);
    } else if (diff < -8) {
      // User scrolling up: immediately show nav bar
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (onSetNavBarVisible) onSetNavBarVisible(true);
    }

    lastScrollY.current = currentY;
  };

  const formatTimestamp = (time: number) => {
    const diffMin = Math.floor((Date.now() - time) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredConversations = conversations.filter(c =>
    c.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupThreads = groupThreads.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorOffset.value }]
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Title "Chats" */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {activeSegment === 'councils' && (
            <TouchableOpacity
              style={styles.newCouncilHeaderBtn}
              onPress={() => setShowCreateCouncilModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.newCouncilHeaderBtnText}>New Council</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => setShowSearchInput(!showSearchInput)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Switcher with Sliding Pill Indicator */}
      <View style={styles.segmentedRow}>
        <Animated.View
          style={[
            styles.activeSegmentPill,
            { width: SEGMENT_WIDTH },
            indicatorAnimatedStyle
          ]}
        />

        <TouchableOpacity
          style={styles.segmentBtn}
          onPress={() => switchSegment('apostles')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeSegment === 'apostles' && styles.segmentTextActive]}>
            👤 1-on-1 Apostles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.segmentBtn}
          onPress={() => switchSegment('councils')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeSegment === 'councils' && styles.segmentTextActive]}>
            🏛️ Councils ({groupThreads.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {showSearchInput && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeSegment === 'apostles' ? "Search 1-on-1 conversations..." : "Search council rooms..."}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loading Skeleton or Swipeable Pager */}
      {isLoading ? (
        <ChatListSkeleton />
      ) : (
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePagerScroll}
          style={{ flex: 1 }}
        >
          {/* Page 1: 1-on-1 Apostles List */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <FlatList
              data={filteredConversations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContainer, { paddingBottom: 120 }]}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ListHeaderComponent={
                <PastoralGuidesRow onSelectGuide={(g) => setSelectedPastoralGuide(g)} />
              }
              renderItem={({ item }) => {
                const persona = getPersonaById(item.personaId);
                return (
                  <TouchableOpacity
                    style={styles.chatRow}
                    onPress={() => onSelectConversation(persona)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.avatarContainer}>
                      <Image source={persona.avatar} style={styles.avatar} resizeMode="cover" />
                    </View>

                    <View style={styles.chatInfo}>
                      <View style={styles.chatHeader}>
                        <Text style={styles.personaName}>{item.personaName}</Text>
                        <Text style={styles.timestamp}>{formatTimestamp(item.updatedAt)}</Text>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.textLight} />
                  <Text style={styles.emptyText}>No conversations found</Text>
                </View>
              }
            />
          </View>

          {/* Page 2: Councils & Group Chats List */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <FlatList
              data={filteredGroupThreads}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContainer, { paddingBottom: 120 }]}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => {
                const memberApostles = APOSTLE_PERSONAS.filter(a => item.memberApostleIds.includes(a.id));
                return (
                  <TouchableOpacity
                    style={styles.councilCard}
                    onPress={() => onSelectGroupCouncil(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.councilCardTop}>
                      <View style={styles.councilAvatarStack}>
                        {memberApostles.slice(0, 3).map((a, i) => (
                          <Image
                            key={a.id}
                            source={a.avatar}
                            style={[
                              styles.councilStackAvatar,
                              { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }
                            ]}
                          />
                        ))}
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.councilName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.councilTopic} numberOfLines={1}>{item.topic}</Text>
                      </View>

                      <Text style={styles.councilTime}>{formatTimestamp(item.updatedAt)}</Text>
                    </View>

                    {item.lastMessage ? (
                      <View style={styles.councilLastMsgRow}>
                        <Text style={styles.councilSpeakerName}>Council:</Text>
                        <Text style={styles.councilLastMsg} numberOfLines={1}>
                          {item.lastMessage}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.councilEmptyMsg}>No messages yet. Tap to start council discussion.</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={Colors.textLight} />
                  <Text style={styles.emptyText}>No Council Discussions</Text>
                  <Text style={styles.emptySubtext}>
                    Bring multiple Apostles together to discuss theology, life, or Scripture.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCreateBtn}
                    onPress={() => setShowCreateCouncilModal(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyCreateBtnText}>Create First Council</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}

      {/* Create New Group Council Modal */}
      <CreateGroupCouncilModal
        visible={showCreateCouncilModal}
        onClose={() => setShowCreateCouncilModal(false)}
        onCouncilCreated={(newThread: GroupCouncilThread) => {
          setShowCreateCouncilModal(false);
          setGroupThreads(prev => [newThread, ...prev]);
          onSelectGroupCouncil(newThread);
        }}
      />

      {/* Pastoral Guide Modal */}
      <PastoralGuideModal
        visible={Boolean(selectedPastoralGuide)}
        guide={selectedPastoralGuide}
        onClose={() => setSelectedPastoralGuide(null)}
        onStartChat={(apostle: ApostlePersona, topicIntro: string) => {
          setSelectedPastoralGuide(null);
          onSelectConversation(apostle, topicIntro);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
  },
  newCouncilHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newCouncilHeaderBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  searchBtn: {
    padding: 6,
  },
  segmentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    padding: 3,
    position: 'relative',
  },
  activeSegmentPill: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  segmentTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111827',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listContainer: {
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  personaName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  lastMessage: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  councilCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  councilCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  councilAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilStackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  councilName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111827',
  },
  councilTopic: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  councilTime: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
  },
  councilLastMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  councilSpeakerName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#374151',
  },
  councilLastMsg: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  councilEmptyMsg: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyCreateBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
