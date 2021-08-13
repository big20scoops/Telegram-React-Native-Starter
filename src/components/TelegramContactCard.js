/** @format **/
import React from 'react';
import {Text, Image, View} from 'react-native';

export const TelegramContactCard = ({telegramAvatarUrl, name}) => {
  console.log('image ==>', telegramAvatarUrl);
  return (
    <View>
      <Image source={telegramAvatarUrl} style={{width: 50, height: 50}} />
      <Text>{name}</Text>
    </View>
  );
};
