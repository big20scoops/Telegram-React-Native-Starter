/** @format **/
import React from 'react';
import {Text, Image, View} from 'react-native';
import {StyleSheet} from 'react-native';

export const TelegramContactCard = ({telegramAvatarUrl, name}) => {
  const {container, image} = styles;
  return (
    <View style={container}>
      <Image style={image} source={telegramAvatarUrl} />
      <Text>{name}</Text>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
});
