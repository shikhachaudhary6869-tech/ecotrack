import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { EcoProvider } from './context/EcoContext';
import './styles/global.css';
import './styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EcoProvider>
          <App />
        </EcoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
