import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TaskSuggestion } from '../api/openaiApi';

interface TaskSuggestionListProps {
  suggestions: TaskSuggestion[];
  onTaskSelect: (task: TaskSuggestion) => Promise<void>;
  isLoading?: boolean;
}

const TaskSuggestionList: React.FC<TaskSuggestionListProps> = ({ 
  suggestions, 
  onTaskSelect,
  isLoading = false 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '중요':
        return '#FF4444';
      case '보통':
        return '#FFBB33';
      case '낮음':
        return '#00C851';
      default:
        return '#757575';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case '중요':
        return '중요';
      case '보통':
        return '보통';
      case '낮음':
        return '낮음';
      default:
        return priority;
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#46B876" />
        <Text style={{ marginTop: 10, color: '#666' }}>Task 제안을 생성하는 중...</Text>
      </View>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>제안할 수 있는 Task가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제안된 작업</Text>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => onTaskSelect(suggestion)}
          style={styles.taskItem}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{suggestion.task}</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(suggestion.priority) }
            ]}>
              <Text style={styles.priorityText}>
                {getPriorityText(suggestion.priority)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
  taskHeader: {
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
});

export default TaskSuggestionList; 