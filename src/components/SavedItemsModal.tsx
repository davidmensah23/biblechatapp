import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { SavedBookmark } from '../types';
import { fetchBookmarks, fetchAllVerseNotes, removeBookmark, VerseNote } from '../services/database';

interface SavedItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenVerseInBible: (book: string, chapter: number) => void;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  visible,
  onClose,
  onOpenVerseInBible
}) => {
  const [tab, setTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [notes, setNotes] = useState<VerseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, nList] = await Promise.all([
        fetchBookmarks(),
        fetchAllVerseNotes()
      ]);
      setBookmarks(bList);
      setNotes(nList);
    } catch (e) {
      console.warn('Error loading saved items:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    await removeBookmark(id);
  };

  const handleShare = async (title: string, text: string) => {
    try {
      await Share.share({
        message: `“${text}”\n— ${title}\n\nBibleChat App: https://biblechatapp.com`,
        title
      });
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved & Reflections</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'bookmarks' && styles.tabItemActive]}
            onPress={() => setTab('bookmarks')}
            activeOpacity={0.75}
          >
            <Ionicons
              name={tab === 'bookmarks' ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={tab === 'bookmarks' ? '#111111' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, tab === 'bookmarks' && styles.tabTextActive]}>
              Bookmarks ({bookmarks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, tab === 'notes' && styles.tabItemActive]}
            onPress={() => setTab('notes')}
            activeOpacity={0.75}
          >
            <Ionicons
              name={tab === 'notes' ? 'document-text' : 'document-text-outline'}
              size={16}
              color={tab === 'notes' ? '#111111' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, tab === 'notes' && styles.tabTextActive]}>
              Notes ({notes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#111111" />
            <Text style={styles.loadingText}>Loading saved treasures...</Text>
          </View>
        ) : tab === 'bookmarks' ? (
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Bookmarked Verses Yet</Text>
                <Text style={styles.emptySubtitle}>
                  While reading Scripture, tap any verse and tap "Bookmark" to save it here.
                </Text>
              </View>
            ) : (
              bookmarks.map((bm) => {
                const parts = (bm.reference || bm.title).split(' ');
                const book = parts.slice(0, -1).join(' ') || 'Genesis';
                const ch = parseInt(parts[parts.length - 1]?.split(':')[0] || '1', 10);

                return (
                  <View key={bm.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.citationBadge}>
                        <Text style={styles.citationText}>{bm.reference || bm.title}</Text>
                      </View>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          onPress={() => handleShare(bm.reference || bm.title, bm.content)}
                          style={styles.iconBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="share-outline" size={17} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveBookmark(bm.id)}
                          style={styles.iconBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={17} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.verseQuote}>“{bm.content}”</Text>

                    <TouchableOpacity
                      style={styles.readInBibleBtn}
                      onPress={() => {
                        onClose();
                        onOpenVerseInBible(book, ch);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.readInBibleText}>Read in Bible</Text>
                      <Ionicons name="arrow-forward" size={13} color="#111111" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {notes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Personal Notes Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap any verse in the Bible and select "Add Note" to write personal reflections.
                </Text>
              </View>
            ) : (
              notes.map((note) => (
                <View key={note.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.citationBadge}>
                      <Text style={styles.citationText}>{note.reference}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleShare(note.reference, `${note.verseText}\nNote: ${note.noteText}`)}
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="share-outline" size={17} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.verseQuoteSmall} numberOfLines={2}>
                    “{note.verseText}”
                  </Text>

                  <View style={styles.noteBox}>
                    <Ionicons name="create-outline" size={14} color="#8B1E1E" style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={styles.noteContent}>{note.noteText}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.readInBibleBtn}
                    onPress={() => {
                      onClose();
                      onOpenVerseInBible(note.book, note.chapter);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.readInBibleText}>Read in Bible</Text>
                    <Ionicons name="arrow-forward" size={13} color="#111111" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#111827',
  },
  tabText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#6B7280',
  },
  tabTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111827',
  },
  scrollList: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#374151',
    marginTop: 14,
  },
  emptySubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  citationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  citationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111827',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
  },
  verseQuote: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 17,
    lineHeight: 25.5,
    color: '#111111',
    marginBottom: 12,
  },
  verseQuoteSmall: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16.5,
    lineHeight: 25,
    color: '#1F2937',
    marginBottom: 10,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8B1E1E',
    marginBottom: 12,
  },
  noteContent: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  readInBibleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readInBibleText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111827',
  },
});
