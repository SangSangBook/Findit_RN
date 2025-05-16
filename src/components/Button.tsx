// /Users/kkm/Findit_RN/Findit/src/components/Button.tsx
import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { buttonStyles as styles } from '../styles/Button.styles';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, isLoading = false, disabled = false, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, (disabled || isLoading) && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled || isLoading || !onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
