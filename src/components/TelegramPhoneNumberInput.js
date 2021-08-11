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

export const TelegramPhoneNumberInput = () => {
  const {TDController} = NativeModules;
  const [phoneNumber, InputPhoneNumber] = useState('');

  const connectToTelegram = () => {
    TDController.sendPhoneNumber(phoneNumber);
  };

  const {input, button} = styles;
  return (
    <ScrollView>
      <Text>Phone Number</Text>
      <TextInput
        style={input}
        value={phoneNumber}
        onChangeText={value => InputPhoneNumber(value)}
      />

      <TouchableOpacity style={button} onPress={connectToTelegram}>
        <Text>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
