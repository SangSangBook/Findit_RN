import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TaskSuggestion } from '../api/openaiApi';

interface TaskSuggestionListProps {
  suggestions: TaskSuggestion[];
}

const TaskSuggestionList: React.FC<TaskSuggestionListProps> = ({ suggestions }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#666666';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제안된 작업</Text>
      {suggestions.map((suggestion, index) => (
        <View key={index} style={styles.taskItem}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(suggestion.priority) }]} />
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{suggestion.task}</Text>
            <Text style={styles.taskDescription}>{suggestion.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  priorityIndicator: {
    width: 4,
    marginRight: 12,
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TaskSuggestionList; 