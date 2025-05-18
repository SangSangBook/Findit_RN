import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TaskSuggestion } from '../api/openaiApi';

interface TaskSuggestionSectionProps {
  suggestions: TaskSuggestion[];
  onTaskSelect: (task: TaskSuggestion) => void;
}

const TaskSuggestionSection: React.FC<TaskSuggestionSectionProps> = ({
  suggestions,
  onTaskSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제안된 작업</Text>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestionItem}
          onPress={() => onTaskSelect(suggestion)}
        >
          <View style={styles.header}>
            <Text style={styles.taskTitle}>{suggestion.task}</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: suggestion.priority === 'high' ? '#FF4444' : 
                               suggestion.priority === 'medium' ? '#FFBB33' : 
                               '#00C851' }
            ]}>
              <Text style={styles.priorityText}>
                {suggestion.priority === 'high' ? '긴급' :
                 suggestion.priority === 'medium' ? '중요' : '보통'}
              </Text>
            </View>
          </View>
          <Text style={styles.description}>{suggestion.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 36,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  suggestionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TaskSuggestionSection; 