import { usePowerSync, useQuery } from "@powersync/react-native";
import { ThoughtRecord } from "@/powersync/AppSchema";
import { useSupabase } from "@/powersync/SystemProvider";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

type EmojiCounter = { emoji: string, count: number }
const commonEmojis = ["❤️", "👍", "😂", "😊", "🔥", "💯", "🚀", "💡", "🌟", "👏"];

function ThoughtReactions({ thoughtId }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const powersync = usePowerSync();
  const connector = useSupabase();

  // Query reactions grouped by emoji with counts
  const { data: reactionGroups } = useQuery<EmojiCounter>(
       /* sql */ `
      SELECT
        emoji,
        COUNT(*) as count
      FROM
        reactions
      WHERE
        thought_id = ?
      GROUP BY
        emoji
      ORDER BY
        count DESC
    `,
    [thoughtId]
  );

  const handleAddReaction = async (emoji: string) => {
    try {

      await powersync.execute(
        /* sql */ `
          INSERT INTO
            reactions (id, thought_id, user_id, emoji, created_at)
          VALUES
            (uuid (), ?, ?, ?, datetime ())
        `,
        [thoughtId, connector.userId, emoji]
      );
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  return (
    <>
      {/* Reactions Section */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row flex-wrap flex-1">
          {reactionGroups.map((group) => (
            <View key={group.emoji} className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-1">
              <Text className="text-base">{group.emoji}</Text>
              {group.count > 1 ? (
                <Text className="text-sm text-gray-600 ml-1">{group.count}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Add Reaction Button */}
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5"
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Text className="text-sm text-gray-600">😊 React</Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <View className="mt-3 bg-white rounded-xl p-3 border border-gray-200">
          <View className="flex-row flex-wrap justify-between">
            {commonEmojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                className="justify-center items-center rounded-lg mb-1 h-10"
                style={{ width: width * 0.15 }}
                onPress={() => handleAddReaction(emoji)}
              >
                <Text className="text-2xl">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

export default function ThoughtsApp() {
  const { top } = useSafeAreaInsets();
  const [showNewThought, setShowNewThought] = useState(false);
  const [newThoughtContent, setNewThoughtContent] = useState("");

  const powersync = usePowerSync();
  const connector = useSupabase();

  // Query all thoughts
  const { data: thoughts } = useQuery<ThoughtRecord>(/* sql */ `
    SELECT
      *
    FROM
      thoughts
    ORDER BY
      created_at DESC
  `);

  const handleAddThought = async () => {
    if (newThoughtContent.trim()) {
      try {
        await powersync.execute(
          /* sql */ `
            INSERT INTO
              thoughts (id, content, created_at, created_by)
            VALUES
              (uuid (), ?, datetime (), ?)
          `,
          [newThoughtContent.trim(), connector.userId]
        );
        setNewThoughtContent("");
        setShowNewThought(false);
      } catch (error) {
        console.error("Error adding thought:", error);
      }
    }
  };

  const handleDeleteThought = async (thoughtId: string) => {
    try {
      // Delete all reactions for this thought first
      await powersync.execute(
        /* sql */ `
          DELETE FROM reactions
          WHERE
            thought_id = ?
        `,
        [thoughtId]
      );
      // Then delete the thought
      await powersync.execute(
        /* sql */ `
          DELETE FROM thoughts
          WHERE
            id = ?
        `,
        [thoughtId]
      );
    } catch (error) {
      console.error("Error deleting thought:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{ paddingTop: top }} className="bg-white border-b border-gray-200 ios:shadow android:elevation-2">
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900">Thoughts</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24">
        {thoughts.map((thought) => (
          <View key={thought.id} className="bg-white rounded-xl p-5 mb-4 ios:shadow android:elevation-2 border border-gray-200">
            {/* Thought Content */}
            <View className="mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg leading-7 text-gray-900 flex-1 mr-2">{thought.content}</Text>
                {thought.created_by === connector.userId && (
                  <TouchableOpacity
                    className="w-8 h-8 bg-red-100 rounded-full justify-center items-center"
                    onPress={() => handleDeleteThought(thought.id)}
                  >
                    <Text className="text-red-600 text-lg font-bold">-</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-sm text-gray-500"> Created: {thought.created_at}</Text>
            </View>

            {/* Reactions Component */}
            <ThoughtReactions thoughtId={thought.id} />
          </View>
        ))}
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full justify-center items-center ios:shadow-lg android:elevation-8"
        onPress={() => setShowNewThought(true)}
      >
        <Text className="text-2xl text-white font-bold">+</Text>
      </TouchableOpacity>

      {/* New Thought Modal */}
      <Modal
        visible={showNewThought}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewThought(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">Share a thought</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base mb-4"
              style={{ height: 120, textAlignVertical: 'top' }}
              value={newThoughtContent}
              onChangeText={setNewThoughtContent}
              placeholder="What's on your mind?"
              multiline
              autoFocus
            />
            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                onPress={() => setShowNewThought(false)}
              >
                <Text className="text-gray-600 text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg ${!newThoughtContent.trim() ? 'bg-gray-400' : 'bg-blue-500'}`}
                onPress={handleAddThought}
                disabled={!newThoughtContent.trim()}
              >
                <Text className="text-white text-base font-semibold">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}