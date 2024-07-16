import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// @ts-ignore
import {SnackbarProvider} from "notistack";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <SnackbarProvider maxSnack={4}>
    <App />
    </SnackbarProvider>
  // </React.StrictMode>
);

reportWebVitals();
