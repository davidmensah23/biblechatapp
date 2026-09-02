import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchConversations, fetchGroupThreads } from '../services/database';
import { getPersonaById, APOSTLE_PERSONAS } from '../services/personas';
import { ConversationThread, ApostlePersona } from '../types';
import { GroupCouncilThread } from '../types/groupChat';
import { CreateGroupCouncilModal } from '../components/CreateGroupCouncilModal';

interface ChatListScreenProps {
  onSelectConversation: (apostle: ApostlePersona) => void;
  onSelectGroupCouncil: (thread: GroupCouncilThread) => void;
  onBack: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onSelectConversation,
  onSelectGroupCouncil,
  onBack
}) => {
  const [activeSegment, setActiveSegment] = useState<'apostles' | 'councils'>('apostles');
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [groupThreads, setGroupThreads] = useState<GroupCouncilThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCreateCouncilModal, setShowCreateCouncilModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await fetchConversations();
    const groups = await fetchGroupThreads();
    setConversations(list);
    setGroupThreads(groups);
  };

  const formatTimestamp = (time: number) => {
    const diffMin = Math.floor((Date.now() - time) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fellowship</Text>
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

      {/* Segmented Switcher */}
      <View style={styles.segmentedRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'apostles' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('apostles')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeSegment === 'apostles' && styles.segmentTextActive]}>
            👤 1-on-1 Apostles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'councils' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('councils')}
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

      {/* 1-on-1 Apostles List */}
      {activeSegment === 'apostles' && (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
      )}

      {/* Councils & Group Chats List */}
      {activeSegment === 'councils' && (
        <FlatList
          data={filteredGroupThreads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
                    {memberApostles.length > 3 && (
                      <View style={[styles.councilStackAvatarMore, { marginLeft: -8, zIndex: 1 }]}>
                        <Text style={styles.councilStackAvatarMoreText}>+{memberApostles.length - 3}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.councilInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.councilName}>{item.name}</Text>
                      <Text style={styles.timestamp}>{formatTimestamp(item.updatedAt)}</Text>
                    </View>
                    <Text style={styles.councilTopic} numberOfLines={1}>
                      {item.topic}
                    </Text>
                  </View>
                </View>

                <View style={styles.councilDivider} />

                <View style={styles.councilBottom}>
                  <Ionicons name="chatbubbles-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                  <Text style={styles.councilLastMsg} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No Council rooms open yet</Text>
              <TouchableOpacity
                style={[styles.newCouncilHeaderBtn, { marginTop: 12 }]}
                onPress={() => setShowCreateCouncilModal(true)}
              >
                <Text style={styles.newCouncilHeaderBtnText}>+ Open First Council</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Create Council Modal */}
      <CreateGroupCouncilModal
        visible={showCreateCouncilModal}
        onClose={() => setShowCreateCouncilModal(false)}
        onCouncilCreated={(thread) => {
          setGroupThreads(prev => [thread, ...prev]);
          onSelectGroupCouncil(thread);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  newCouncilHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  newCouncilHeaderBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#ECECEC',
    borderRadius: 14,
    marginHorizontal: 20,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#777777',
  },
  segmentTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#ECECEC',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personaName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  lastMessage: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  councilCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  councilCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilStackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  councilStackAvatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  councilStackAvatarMoreText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#777777',
  },
  councilInfo: {
    flex: 1,
    marginLeft: 12,
  },
  councilName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
  },
  councilTopic: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    marginTop: 1,
  },
  councilDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  councilBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilLastMsg: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 19,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
});
