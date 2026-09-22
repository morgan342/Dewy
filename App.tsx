import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AddProductToCabinetScreen } from './src/screens/AddProductToCabinetScreen';
import { theme } from './src/theme/tokens';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AddProductToCabinetScreen
        onBackToCabinet={() => {
          /* Cabinet navigation wired in a later prompt */
        }}
        onAddProduct={() => {
          /* Persistence wired in a later prompt */
        }}
      />
    </>
  );
}

// Keep theme reference so tree-shaking never drops tokens in typecheck contexts
void theme;
