# `react-use-pusher`

> Easy as [React hooks](https://reactjs.org/docs/hooks-intro.html) that integrate with the [`pusher-js`](https://github.com/pusher/pusher-js) library.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
- [`useChannel`](#usechannel)
- [`usePresenceChannel`](#usepresencechannel)
- [`useEvent`](#useevent)
- [`useClientTrigger`](#useclienttrigger)
- [`usePusher`](#usepusher)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

`npm install react-use-pusher`

## Usage

You must wrap your app with a `PusherProvider` and pass it config props for [`pusher-js`](https://github.com/pusher/pusher-js) initialisation.

```tsx
import React from 'react';
import { PusherProvider } from 'react-use-pusher';

const App = () => {
  <PusherProvider
    clientKey={process.env.CLIENT_KEY} // get this from the admin app
    cluser="eu"
    // if you're using presence channels
    channelAuthEndpoint="/api/auth"
    // TIP: if you're hosting your own websocket server via something like Soketi
    // you can pass additional pusher options for the websocket connection via the prop bellow
    // recommend you either memoise these options or
    // use a statically defined object outside the component if possible
      
    // options={{ wsHost: 'MY_HOST', wssPort: 1234, wsPort:1233, wsPath: '/my-path' }}
  >
    <Example />
  </PusherProvider>;
};
```

## `useChannel`

Use this hook to subscribe to a channel.

```tsx
// returns channel instance.
const channel = useChannel('channel-name');
```

## `usePresenceChannel`

Presence channels allow you to see who else is connected

```tsx
const Example = () => {
  const { members, myID } = usePresenceChannel('presence-dashboard');

  return (
    <ul>
      {members
        // filter self from members
        .filter(({ id }) => id !== myID)
        // map them to a list
        .map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
    </ul>
  );
};
```

## `useEvent`

Bind to events on a channel with a callback.

```tsx
const Example = () => {
  const [message, setMessages] = useState();
  const channel = useChannel('channel-name');
  useEvent(channel, 'event name', (data) => console.log(data));
};
```

_Note_: This will bind and unbind to the event on each render. You may want to memoise your callback with `useCallback` before passing it in.

## `useClientTrigger`

Message other clients directly. use [client events](https://pusher.com/docs/channels/using_channels/events#triggering-client-events) to push directly from the client:

```tsx
import { useChannel, useClientTrigger } from 'react-use-pusher';

const Example = () => {
  const channel = useChannel('presence-dashboard');
  const trigger = useClientTrigger(channel);
  const handleClientEvent = () => {
    trigger('event name', eventData);
  };

  return <button onClick={handleClientEvent}>Fire</button>;
};
```


## `usePusher`

Get access to the Pusher instance to do other things.

```tsx
import { usePusher } from 'react-use-pusher';

const Example = () => {
  const { client } = usePusher();

  return null;
};
```