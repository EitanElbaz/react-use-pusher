import { createContext } from 'react';
import { ChannelsContextValues } from './types';

export const ChannelsContext = createContext<ChannelsContextValues>({});
