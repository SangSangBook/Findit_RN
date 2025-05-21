import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LoadingWaveProps {
  color?: string;
  size?: 'small' | 'normal';
}

const LoadingWave: React.FC<LoadingWaveProps> = ({ 
  color = '#FFFFFF',
  size = 'normal' 
}) => {
  const [animations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    const animate = () => {
      const sequences = animations.map((anim, index) => {
        return Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]);
      });

      Animated.stagger(100, sequences).start(() => animate());
    };

    animate();
  }, []);

  const containerStyle = size === 'small' 
    ? styles.smallContainer 
    : styles.container;
  
  const barStyle = size === 'small'
    ? styles.smallBar
    : styles.loadingBar;

  return (
    <View style={containerStyle}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            barStyle,
            {
              backgroundColor: color,
              opacity: anim,
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: '100%', // 가로 전체 너비 사용
  },
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: '100%', // 가로 전체 너비 사용
  },
  loadingBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  smallBar: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  }
});

export default LoadingWave;