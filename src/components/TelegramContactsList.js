import React, {useMemo} from 'react';
import {Platform} from 'react-native';

import {TelegramContactCard} from './TelegramContactCard';

export const TelegramContactsList = ({contactIdsList, contactsInfo}) => {
  const telegramContactsList = useMemo(
    () => contactsInfo.filter(({id}) => contactIdsList.includes(id)),
    [contactIdsList, contactsInfo],
  );

  return telegramContactsList.map(person => {
    return (
      <TelegramContactCard
        key={person.id}
        name={person.name}
        telegramAvatarUrl={
          person.image && {
            uri:
              Platform.OS === 'android'
                ? `file://${person.image.path}`
                : person.image.path,
          }
        }
      />
    );
  });
};
