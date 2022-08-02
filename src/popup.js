import { createRoot } from 'react-dom/client';
import React from 'react';

function App() {
  return <h1>Hello, world!</h1>;
}

createRoot(document.getElementById('root')).render(<App/>);
