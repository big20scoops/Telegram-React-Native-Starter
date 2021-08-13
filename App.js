/** @format **/
import React, {useEffect, useCallback, useState} from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {
  REACT_APP_TELEGRAM_API_ID,
  REACT_APP_TELEGRAM_API_HASH,
  TELEGRAM_EVENT,
  TELEGRAM_CONTACT_EVENT,
} from './src/constants';
import {TelegramPhoneNumberInput} from './src/components/TelegramPhoneNumberInput';
import {TelegramCodeInput} from './src/components/TelegramCodeInput';
import {TelegramPasswordInput} from './src/components/TelegramPasswordInput';
import {styles} from './src/styles';
import {TelegramContactsList} from './src/components/TelegramContactsList';

const App = () => {
  const {TDController} = NativeModules;
  const [telegramState, updateTelegramState] = useState('');
  const [isStarted, start] = useState(false);

  const [contactIdsList, setContactIdsList] = useState([]);
  const [contactsInfo, setContactsInfo] = useState([]);

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

    const contactListener = eventEmitter.addListener(
      TELEGRAM_CONTACT_EVENT,
      async ({contacts: tdContacts, contact: tdContact, file: tdFile}) => {
        if (tdContacts) {
          setContactIdsList(tdContacts);
        }

        if (tdContact) {
          const {id, first_name, last_name} = tdContact;
          const image = tdContact?.profile_photo?.small;
          const transformedContact = {
            id,
            name: `${first_name} ${last_name}`,
            image,
          };
          setContactsInfo(oldArray => [...oldArray, transformedContact]);
          if (image) {
            TDController.downloadFile(image.id);
          }
        }

        if (tdFile) {
          const {id, path} = tdFile;
          if (path) {
            setContactImagePath(id, path);
          }
        }
      },
    );

    startTDLib();

    return () => {
      eventListener.remove();
      contactListener.remove();
    };
  }, [TDController, setContactImagePath, startTDLib]);

  const startTDLib = useCallback(() => {
    if (!isStarted) {
      TDController.startTDLib();
      start(true);
    }
  }, [TDController, isStarted]);

  const setContactImagePath = useCallback((id, path) => {
    setContactsInfo(contactsInfo => {
      let newContactsInfo = contactsInfo;

      let correctUser = contactsInfo.filter(
        user => user.image && user.image.id === id,
      );
      if (correctUser[0]) {
        const newContact = {...correctUser[0], image: {id, path}};

        const otherUsers = contactsInfo.filter(
          user => !user.image || user.image.id !== id,
        );

        newContactsInfo = [...otherUsers, newContact];
      }
      return newContactsInfo;
    });
  }, []);

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
    } else if (telegramState === 'authorizationStateReady') {
      return (
        <TelegramContactsList
          contactIdsList={contactIdsList}
          contactsInfo={contactsInfo}
        />
      );
    } else {
      return <View />;
    }
  }, [contactIdsList, contactsInfo, telegramState]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>{renderScreen()}</ScrollView>
    </SafeAreaView>
  );
};

export default App;
