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

export const TelegramCodeInput = () => {
  const {TDController} = NativeModules;
  const [code, InputCode] = useState('');

  const connectToTelegram = () => {
    TDController.sendCode(code);
  };

  const {input, button} = styles;
  return (
    <ScrollView>
      <Text>Phone Number</Text>
      <TextInput
        style={input}
        value={code}
        onChangeText={value => InputCode(value)}
      />

      <TouchableOpacity style={button} onPress={connectToTelegram}>
        <Text>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
