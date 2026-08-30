import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchConversations } from '../services/database';
import { getPersonaById } from '../services/personas';
import { ConversationThread, ApostlePersona } from '../types';

interface ChatListScreenProps {
  onSelectConversation: (apostle: ApostlePersona) => void;
  onBack: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ onSelectConversation, onBack }) => {
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const list = await fetchConversations();
    setConversations(list);
  };

  const formatTimestamp = (time: number) => {
    const diffMin = Math.floor((Date.now() - time) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredConversations = conversations.filter(c =>
    c.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setShowSearchInput(!showSearchInput)}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {showSearchInput && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
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

      {/* Conversation List */}
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
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ECECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#E2E2E8',
  },
  avatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.35 }, { translateY: 2 }],
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personaName: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  lastMessage: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
  }
});
