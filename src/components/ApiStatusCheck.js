import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const ApiStatusCheck = ({ onNavigateToHelp }) => {
  const { t } = useTranslation();
  const { checkHealth } = useAPI();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setStatus('checking');
        setError(null);
        await checkHealth();
        setStatus('connected');
      } catch (err) {
        setStatus('error');
        setError(err.message);
        
        // 5秒后自动重试
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000);
      }
    };
    
    checkStatus();
  }, [retryCount]);
  
  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <span className="api-status-icon checking">⚡</span>;
      case 'connected':
        return <span className="api-status-icon connected">✅</span>;
      case 'error':
        return <span className="api-status-icon error">❌</span>;
      default:
        return <span className="api-status-icon">🔄</span>;
    }
  };
  
  const getStatusTitle = () => {
    switch (status) {
      case 'checking':
        return t('checkingApi');
      case 'connected':
        return t('apiConnected');
      case 'error':
        return t('apiNotStarted');
      default:
        return t('checkingApi');
    }
  };
  
  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return t('checkingApi');
      case 'connected':
        return 'API服务器连接成功，正在加载应用...';
      case 'error':
        return t('apiNotStartedDesc');
      default:
        return t('checkingApi');
    }
  };
  
  return (
    <div className="api-status-check">
      <div className="api-status-card">
        {getStatusIcon()}
        <h2 className="api-status-title">{getStatusTitle()}</h2>
        <p className="api-status-message">{getStatusMessage()}</p>
        
        {status === 'error' && (
          <div className="api-status-detail">
            <strong>📥 下载提示：</strong><br />
            请下载并运行 <strong>02agentAPP.exe</strong> 来启动本地服务器<br /><br />
            
            <strong>🔄 或者手动启动：</strong><br />
            1. 在项目目录运行：<code>npm run api</code><br />
            2. 检查端口是否被占用（默认3000）<br />
            3. 确认网络连接正常<br /><br />
            
            <strong>❌ 错误详情：</strong><br />
            {error}<br /><br />
            自动重试中...（第{retryCount + 1}次尝试）<br /><br />
            
            {onNavigateToHelp && (
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={onNavigateToHelp}
                  className="md-button"
                  style={{ width: '100%' }}
                >
                  📖 查看使用帮助
                </button>
              </div>
            )}
          </div>
        )}
        
        {status === 'checking' && (
          <div className="api-status-detail">
            正在连接API服务器，请稍候...
          </div>
        )}
        
        {status === 'connected' && (
          <div className="api-status-detail">
            ✅ API服务器响应正常<br />
            🚀 正在初始化应用界面...
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatusCheck;