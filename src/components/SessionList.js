import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const SessionList = ({ 
  sessions, 
  currentSession, 
  onSessionSelect, 
  onCreateSession, 
  onDeleteSession,
  onExportSessions,
  onImportSessions 
}) => {
  const { t } = useTranslation();
  const { getChatSessions } = useAPI();
  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportSessions(file);
      event.target.value = ''; // 清空文件输入
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // 获取会话的显示名称（第一条消息或默认名称）
  const getSessionDisplayName = (session) => {
    if (session.name) {
      return session.name;
    }
    if (session.messages && session.messages.length > 0) {
      const firstMessage = session.messages[0];
      if (firstMessage.role === 'user') {
        return firstMessage.content.length > 30 
          ? firstMessage.content.substring(0, 30) + '...'
          : firstMessage.content;
      }
    }
    return `会话 ${session.sessionId.slice(-6)}`;
  };
  
  return (
    <div className="session-list">
      <div className="md-sidebar-header">
        <h3 className="md-sidebar-title">{t('chat')}</h3>
      </div>
      
      {/* 操作按钮 - 分行显示 */}
      <div className="session-actions-vertical" style={{ marginBottom: '16px' }}>
        <button className="md-button session-action-btn" onClick={onCreateSession}>
          ➕ {t('newSession')}
        </button>
        
        <button className="md-button session-action-btn" onClick={onExportSessions}>
          📤 {t('exportSessions')}
        </button>
        
        <label className="md-button session-action-btn" style={{ cursor: 'pointer' }}>
          📥 {t('importSessions')}
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      {/* 会话列表 */}
      <div className="session-list-content">
        {sessions.length === 0 ? (
          <div className="md-empty-state">
            <div className="md-empty-state-icon">💬</div>
            <div className="md-empty-state-text">{t('noSessions')}</div>
            <button className="md-button" onClick={onCreateSession}>
              {t('newSession')}
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`md-session-item ${
                currentSession?.sessionId === session.sessionId ? 'active' : ''
              }`}
              onClick={() => onSessionSelect(session)}
            >
              <div className="md-session-info">
                <div className="md-session-name">
                  {getSessionDisplayName(session)}
                </div>
                <div className="md-session-meta">
                  {t('messages')}: {session.messageCount} • {formatDate(session.createdAt)}
                </div>
              </div>
              
              <div className="md-session-actions">
                {/* 删除了编辑按钮，只保留删除按钮 */}
                <button
                  className="md-icon-button session-delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.sessionId);
                  }}
                  title={t('delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;