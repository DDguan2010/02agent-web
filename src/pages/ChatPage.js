import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';
import SessionList from '../components/SessionList';
import ChatArea from '../components/ChatArea';
import MCPSidebar from '../components/MCPSidebar';

const ChatPage = () => {
  const { t } = useTranslation();
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    getChatSessions, 
    createChatSession, 
    deleteChatSession,
    exportSessions,
    importSessions
  } = useAPI();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        await getChatSessions();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadSessions();
  }, []);
  
  const handleCreateSession = async () => {
    try {
      const newSession = await createChatSession();
      // 新会话会自动设置为当前会话
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await deleteChatSession(sessionId);
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  const handleExportSessions = async () => {
    try {
      await exportSessions();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleImportSessions = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.sessions || !Array.isArray(data.sessions)) {
        throw new Error('Invalid session file format');
      }
      
      const merge = window.confirm('Merge with existing sessions?\nClick OK to merge, Cancel to overwrite');
      await importSessions(data.sessions, merge);
      
      alert(t('importSuccess'));
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="md-loading">
        <div>⏳ {t('connecting')}...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="md-error">
        <strong>{t('error')}:</strong> {error}
      </div>
    );
  }
  
  return (
    <div className="chat-page">
      <div className="md-layout">
        {/* 左侧会话列表 */}
        <div className="md-sidebar">
          <SessionList
            sessions={sessions}
            currentSession={currentSession}
            onSessionSelect={setCurrentSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onExportSessions={handleExportSessions}
            onImportSessions={handleImportSessions}
          />
        </div>
        
        {/* 中间聊天区域 */}
        <div className="md-main-content">
          <ChatArea 
            session={currentSession}
            onSessionUpdate={getChatSessions}
          />
        </div>
        
        {/* 右侧MCP管理 */}
        <div className="md-sidebar">
          <MCPSidebar />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;