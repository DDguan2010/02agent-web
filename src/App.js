import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { APIProvider, useAPI } from './contexts/APIContext';
import Navigation from './components/Navigation';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import ApiStatusCheck from './components/ApiStatusCheck';
import './App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = React.useState('chat');
  const { apiStatus } = useAPI();
  
  // 处理导航到帮助页面
  const handleNavigateToHelp = () => {
    setCurrentPage('help');
  };
  
  // 处理从帮助页面返回
  const handleBackFromHelp = () => {
    if (apiStatus !== 'connected') {
      // 如果API未连接，返回时显示API状态检查页面
      setCurrentPage('chat'); // 这会触发重新检查API状态
    } else {
      // 如果API已连接，返回聊天页面
      setCurrentPage('chat');
    }
  };
  
  // 如果API未连接且当前不在帮助页面，显示状态检查页面
  if (apiStatus !== 'connected' && currentPage !== 'help') {
    return <ApiStatusCheck onNavigateToHelp={handleNavigateToHelp} />;
  }
  
  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'chat' ? <ChatPage /> : 
         currentPage === 'help' ? <HelpPage onBack={handleBackFromHelp} /> : 
         <SettingsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <APIProvider>
        <div className="app-container">
          <AppContent />
        </div>
      </APIProvider>
    </LanguageProvider>
  );
}

export default App;