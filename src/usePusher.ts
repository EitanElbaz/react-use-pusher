import { useContext, useEffect } from 'react';
import { PusherContextValues } from './types';
import { PusherContext } from './PusherContext';

export const NOT_IN_CONTEXT_WARNING =
  'No Pusher context. Did you forget to wrap your app in a <PusherProvider />?';

export function usePusher() {
  const context = useContext<PusherContextValues>(PusherContext);
  useEffect(
    function warnAboutMissingContext() {
      if (!Object.keys(context).length) console.warn(NOT_IN_CONTEXT_WARNING);
    },
    [context],
  );
  return context;
}
