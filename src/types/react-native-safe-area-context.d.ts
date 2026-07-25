declare module 'react-native-safe-area-context' {
  import * as React from 'react';

  export interface SafeAreaContext {
    bottom: number;
    top: number;
    left: number;
    right: number;
  }

  export function useSafeAreaInsets(): SafeAreaContext;
  export class SafeAreaProvider extends React.Component<any> {}
  export class SafeAreaView extends React.Component<any> {}
}
