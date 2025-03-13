import { useContext, useEffect } from 'react';
import { ChannelsContextValues } from './types';
import { ChannelsContext } from './ChannelsContext';

const NOT_IN_CONTEXT_WARNING =
  'No Channels context. Did you forget to wrap your app in a <ChannelsProvider />?';

export function useChannelsContext() {
  const context = useContext<ChannelsContextValues>(ChannelsContext);
  useEffect(
    function warnAboutMissingContext() {
      if (!context || !Object.keys(context).length) console.warn(NOT_IN_CONTEXT_WARNING);
    },
    [context],
  );
  return context;
}
