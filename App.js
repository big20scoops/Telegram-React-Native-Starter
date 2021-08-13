/** @format **/
import React, {useEffect, useCallback, useState} from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  View,
  SafeAreaView,
} from 'react-native';

import {
  REACT_APP_TELEGRAM_API_ID,
  REACT_APP_TELEGRAM_API_HASH,
  TELEGRAM_EVENT,
} from './src/constants';
import {TelegramPhoneNumberInput} from './src/components/TelegramPhoneNumberInput';
import {TelegramCodeInput} from './src/components/TelegramCodeInput';
import {TelegramPasswordInput} from './src/components/TelegramPasswordInput';

const App = () => {
  const {TDController} = NativeModules;
  const [telegramState, updateTelegramState] = useState('');
  const [isStarted, start] = useState(false);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(TDController);
    const eventListener = eventEmitter.addListener(TELEGRAM_EVENT, event => {
      if (event.state === 'authorizationStateWaitTdlibParameters') {
        TDController.initialTDLibs(
          REACT_APP_TELEGRAM_API_ID,
          REACT_APP_TELEGRAM_API_HASH,
          'en',
          'emulator/simulator',
          '14/12',
          '0.0.1',
        );
      } else {
        if (event.state === 'authorizationStateReady') {
          TDController.getContacts();
        }
        updateTelegramState(event.state);
      }
    });

    // const contactListener = eventEmitter.addListener(
    //   TELEGRAM_CONTACT_EVENT,
    //   async ({contacts: tdContacts, contact: tdContact, file: tdFile}) => {
    //     if (tdContacts) {
    //       dispatch(setContactIdsList(tdContacts));
    //     }

    //     if (tdContact) {
    //       const {id, first_name, last_name} = tdContact;
    //       const image = tdContact?.profile_photo?.small;
    //       const autobahnWallet = await getTelegramAutobahnAddressLookup(id);
    //       const transformedContact = {
    //         id,
    //         autobahnWallet,
    //         name: `${first_name} ${last_name}`,
    //         image,
    //       };
    //       dispatch(setContactsInfo(transformedContact));
    //       if (image) {
    //         TDController.downloadFile(image.id);
    //       }
    //     }

    //     if (tdFile) {
    //       const {id, path} = tdFile;
    //       if (path) {
    //         dispatch(setContactImagePath({id, path}));
    //       }
    //     }
    //   },
    // );

    startTDLib();

    return () => {
      eventListener.remove();
      // contactListener.remove();
    };
  }, [TDController, startTDLib]);

  const startTDLib = useCallback(() => {
    if (!isStarted) {
      TDController.startTDLib();
      start(true);
    }
  }, [TDController, isStarted]);

  const renderScreen = useCallback(() => {
    if (telegramState === 'updateAuthorizationState') {
      return <View />;
    } else if (
      telegramState === 'authorizationStateWaitPhoneNumber' ||
      telegramState === 'authorizationStateWaitRegistration'
    ) {
      return <TelegramPhoneNumberInput />;
    } else if (telegramState === 'authorizationStateWaitCode') {
      return <TelegramCodeInput />;
    } else if (telegramState === 'authorizationStateWaitPassword') {
      return <TelegramPasswordInput />;
      // } else if (telegramState === 'authorizationStateReady') {
      //   return <TelegramContactsList />;
    } else {
      return <View />;
    }
  }, [telegramState]);

  return <SafeAreaView style={{ padding: 10 }}>{renderScreen()}</SafeAreaView>;
};

export default App;
