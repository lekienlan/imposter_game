import './data/i18nSetup';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'pixel-retroui/dist/index.css';
import { App } from './presentation/App';
import './presentation/design-system/colors.css';
import './presentation/index.css';
import './presentation/styles/theme.css';
import './presentation/styles/layout.css';
import './presentation/styles/components.css';
import './presentation/styles/lobbyControls.css';
import './presentation/styles/languageSwitcher.css';
import './presentation/styles/uxEnhancements.css';
import './presentation/styles/responsive.css';
import './presentation/styles/shareModal.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
