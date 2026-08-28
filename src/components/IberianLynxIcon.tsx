import React from 'react';
import {
  Image,
  View,
  StyleSheet,
} from 'react-native';

interface IberianLynxIconProps {
  size?: number;
}

export default function IberianLynxIcon({
  size = 150,
}: IberianLynxIconProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Image
        source={require('../../assets/images/IberianLynxIcon.png')}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});