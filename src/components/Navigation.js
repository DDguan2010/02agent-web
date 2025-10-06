import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const Navigation = ({ currentPage, onPageChange }) => {
  const { t, toggleLanguage } = useTranslation();
  const { apiStatus } = useAPI();
  
  return (
    <nav className="navigation">
      <div className="navigation-content">
        <div className="nav-logo">
          <img src="/ico.png" alt={t('appTitle')} />
          <h1>{t('appTitle')}</h1>
        </div>
        
        <div className="nav-buttons">
          <button 
            className={`nav-button ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => onPageChange('chat')}
          >
            {t('chat')}
          </button>
          
          <button 
            className={`nav-button ${currentPage === 'help' ? 'active' : ''}`}
            onClick={() => onPageChange('help')}
          >
            {t('help')}
          </button>
          
          <button 
            className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onPageChange('settings')}
          >
            {t('settings')}
          </button>
          
          <button 
            className="lang-button"
            onClick={toggleLanguage}
            title="切换语言 / Switch Language"
          >
            🌍
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;