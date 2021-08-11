/** @format **/
import React, {useState} from 'react';
import {
  NativeModules,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {styles} from '../styles';

export const TelegramPasswordInput = () => {
  const {TDController} = NativeModules;
  const [password, InputPassword] = useState('');

  const connectToTelegram = () => {
    TDController.sendPassword(password);
  };

  const {input, button} = styles;
  return (
    <ScrollView>
      <Text>Password</Text>
      <TextInput
        style={input}
        value={password}
        onChangeText={value => InputPassword(value)}
      />

      <TouchableOpacity style={button} onPress={connectToTelegram}>
        <Text>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
