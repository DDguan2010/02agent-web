import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const MCPSidebar = () => {
  const { t } = useTranslation();
  const { 
    mcpStatus, 
    getMCPConfig, 
    addMCPServer, 
    deleteMCPServer, 
    connectMCPServers, 
    disconnectMCPServers,
    getMCPStatus 
  } = useAPI();
  
  const [servers, setServers] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showJsonForm, setShowJsonForm] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    command: '',
    args: '',
    type: 'stdio',
    url: ''
  });
  const [jsonConfig, setJsonConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  
  // 加载MCP配置并定期检查状态
  useEffect(() => {
    loadMCPConfig();
    
    // 定期检查MCP状态（每5秒检查一次）
    const interval = setInterval(async () => {
      try {
        await getMCPStatus();
      } catch (err) {
        console.error('MCP状态检查失败:', err);
      }
    }, 5000);
    
    setStatusCheckInterval(interval);
    
    // 清理定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);
  
  // 当MCP状态变化时，同步更新本地状态
  useEffect(() => {
    if (mcpStatus) {
      console.log('MCP状态更新:', mcpStatus);
    }
  }, [mcpStatus]);
  
  const loadMCPConfig = async () => {
    try {
      const config = await getMCPConfig();
      setServers(config.mcpServers || {});
      // 同时获取当前MCP状态
      await getMCPStatus();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleAddServer = async (e) => {
    e.preventDefault();
    
    if (!newServer.name) {
      setError(t('requiredFields'));
      return;
    }
    
    // 验证不同类型服务器的必填字段
    if (newServer.type === 'stdio') {
      if (!newServer.command || !newServer.args) {
        setError('Stdio类型服务器需要填写命令和参数');
        return;
      }
    } else if (newServer.type === 'streamable-http') {
      if (!newServer.url) {
        setError('Streamable-http类型服务器需要填写URL');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let serverConfig = {
        type: newServer.type
      };
      
      if (newServer.type === 'stdio') {
        // 解析JSON参数
        let args;
        try {
          args = JSON.parse(newServer.args);
        } catch (err) {
          setError(t('invalidJson'));
          return;
        }
        
        serverConfig = {
          ...serverConfig,
          command: newServer.command,
          args: args
        };
      } else if (newServer.type === 'streamable-http') {
        serverConfig = {
          ...serverConfig,
          url: newServer.url
        };
      }
      
      await addMCPServer(newServer.name, serverConfig);
      
      // 重置表单
      setNewServer({ name: '', command: '', args: '', type: 'stdio', url: '' });
      setShowAddForm(false);
      
      // Simple success message
      setError(`MCP server '${newServer.name}' added successfully`);
      
      // 重新加载配置和状态
      await loadMCPConfig();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJsonConfig = async (e) => {
    e.preventDefault();
    
    if (!jsonConfig.trim()) {
      setError('请输入JSON配置');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 解析JSON配置
      let config;
      try {
        config = JSON.parse(jsonConfig);
      } catch (err) {
        setError('JSON格式错误: ' + err.message);
        return;
      }
      
      // 验证配置格式
      if (!config.mcpServers || typeof config.mcpServers !== 'object') {
        setError('配置格式错误：需要包含 mcpServers 对象');
        return;
      }
      
      // 批量添加服务器
      for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
        await addMCPServer(name, serverConfig);
      }
      
      // 重置表单
      setJsonConfig('');
      setShowJsonForm(false);
      
      // 重新加载配置和状态
      await loadMCPConfig();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteServer = async (serverName) => {
    if (window.confirm(`确定要删除MCP服务器 "${serverName}" 吗？`)) {
      try {
        setLoading(true);
        await deleteMCPServer(serverName);
        await loadMCPConfig();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleConnectServer = async (serverName) => {
    try {
      setLoading(true);
      setError(null);
      
      await connectMCPServers([serverName]);
      await getMCPStatus();
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisconnectServer = async () => {
    try {
      setLoading(true);
      setError(null); // 清除之前的错误
      console.log('Disconnecting all MCP servers...');
      
      await disconnectMCPServers();
      console.log('MCP servers disconnected');
      
      // 断开连接后立即更新状态
      await getMCPStatus();
      console.log('MCP状态已更新');
    } catch (err) {
      console.error('MCP disconnect failed:', err);
      setError(`${t('connectionFailed')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectAll = async () => {
    try {
      setLoading(true);
      await connectMCPServers();
      // 连接后立即更新状态
      await getMCPStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const isServerConnected = (serverName) => {
    if (!mcpStatus || !mcpStatus.connected) {
      return false;
    }
    return mcpStatus.availableTools?.some(tool => tool.name.startsWith(`${serverName}_`)) || false;
  };
  
  // 手动刷新MCP状态
  const refreshMCPStatus = async () => {
    try {
      setLoading(true);
      await getMCPStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mcp-sidebar">
      <div className="md-sidebar-header">
        <h3 className="md-sidebar-title">{t('mcpServers')}</h3>
      </div>
      
      {/* 操作按钮 - 分行显示 */}
      <div className="mcp-actions-vertical" style={{ marginBottom: '16px' }}>
        <button 
          className="md-button mcp-action-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          ➕ {t('addMCPServer')}
        </button>
        
        <button 
          className="md-button mcp-action-btn" 
          onClick={() => setShowJsonForm(!showJsonForm)}
          disabled={loading}
        >
          📋 {t('addMCPJsonConfig')}
        </button>
        
        <button 
          className="md-button mcp-action-btn" 
          onClick={handleConnectAll}
          disabled={loading}
        >
          🚀 {t('startAll')}
        </button>
        
        {mcpStatus?.connected && (
          <button 
            className="md-button mcp-action-btn" 
            onClick={handleDisconnectServer}
            disabled={loading}
          >
            ⏹️ {t('stopAll')}
          </button>
        )}
        
        <button 
          className="md-button mcp-action-btn" 
          onClick={refreshMCPStatus}
          disabled={loading}
          title={t('refreshMCPStatus')}
        >
          🔄 {t('refreshStatus')}
        </button>
      </div>
      
      {/* MCP状态显示 */}
      {mcpStatus && (
        <div className="mcp-status-display">
          <div className={`mcp-status-card ${mcpStatus.connected ? 'connected' : 'disconnected'}`}>
            <div className="mcp-status-header">
              <span className={`mcp-status-indicator ${mcpStatus.connected ? 'online' : 'offline'}`}></span>
              <strong className="mcp-status-text">
                {mcpStatus.connected ? t('connected') : t('disconnected')}
              </strong>
            </div>
            <div className="mcp-status-detail">
              {mcpStatus.toolCount > 0 ? `${mcpStatus.toolCount} ${t('availableTools')}` : t('noToolsAvailable')}
            </div>
            {mcpStatus.connected && mcpStatus.availableTools && (
              <div className="mcp-tools-list">
                <small>{t('toolList')}:</small>
                <div className="mcp-tools-names">
                  {mcpStatus.availableTools.slice(0, 3).map((tool, index) => (
                    <span key={index} className="mcp-tool-name">
                      {tool.name}
                    </span>
                  ))}
                  {mcpStatus.availableTools.length > 3 && (
                    <span className="mcp-more-tools">
                      +{mcpStatus.availableTools.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 添加服务器表单 */}
      {showAddForm && (
        <div className="md-card" style={{ marginBottom: '16px' }}>
          <form onSubmit={handleAddServer}>
            <div className="md-form-group">
              <label className="md-form-label">{t('serverName')}</label>
              <input
                type="text"
                value={newServer.name}
                onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                className="md-text-field"
                placeholder="fetch"
              />
            </div>
            
            <div className="md-form-group">
              <label className="md-form-label">服务器类型</label>
              <select
                value={newServer.type}
                onChange={(e) => setNewServer(prev => ({ ...prev, type: e.target.value }))}
                className="md-text-field"
              >
                <option value="stdio">Stdio (命令行)</option>
                <option value="streamable-http">Streamable HTTP</option>
              </select>
            </div>
            
            {newServer.type === 'stdio' ? (
              <>
                <div className="md-form-group">
                  <label className="md-form-label">{t('command')}</label>
                  <input
                    type="text"
                    value={newServer.command}
                    onChange={(e) => setNewServer(prev => ({ ...prev, command: e.target.value }))}
                    className="md-text-field"
                    placeholder="npx"
                  />
                </div>
                
                <div className="md-form-group">
                  <label className="md-form-label">{t('args')}</label>
                  <textarea
                    value={newServer.args}
                    onChange={(e) => setNewServer(prev => ({ ...prev, args: e.target.value }))}
                    className="md-form-textarea"
                    placeholder='["-y", "@iflow-mcp/fetch@1.0.2"]'
                  />
                  <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    JSON格式的参数数组
                  </small>
                </div>
              </>
            ) : (
              <div className="md-form-group">
                <label className="md-form-label">服务器URL</label>
                <input
                  type="text"
                  value={newServer.url}
                  onChange={(e) => setNewServer(prev => ({ ...prev, url: e.target.value }))}
                  className="md-text-field"
                  placeholder="http://127.0.0.1:12306/mcp"
                />
                <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Streamable HTTP服务器的URL地址
                </small>
              </div>
            )}
            
            <div className="mcp-form-actions">
              <button type="submit" className="md-button mcp-form-btn" disabled={loading && showAddForm}>
                {loading ? '添加中...' : t('add')}
              </button>
              <button 
                type="button" 
                className="md-button mcp-form-btn" 
                onClick={() => setShowAddForm(false)}
                disabled={loading && showAddForm}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* JSON配置表单 */}
      {showJsonForm && (
        <div className="md-card" style={{ marginBottom: '16px' }}>
          <form onSubmit={handleJsonConfig}>
            <div className="md-form-group">
              <label className="md-form-label">添加MCPjson配置</label>
              <textarea
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                className="md-form-textarea"
                rows="12"
                placeholder='{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@iflow-mcp/server-github@0.6.2"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "values": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": {
          "type": "string",
          "title": "GitHub个人访问令牌",
          "description": "GitHub个人访问令牌",
          "default": "your_github_token_here"
        }
      }
    },
    "streamable-mcp-server": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:12306/mcp"
    }
  }
}'
              />
              <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                支持完整JSON配置，包括env和values字段
              </small>
            </div>
            
            <div className="mcp-form-actions">
              <button type="submit" className="md-button mcp-form-btn" disabled={loading && showJsonForm}>
                {loading ? '添加中...' : '添加配置'}
              </button>
              <button 
                type="button" 
                className="md-button mcp-form-btn" 
                onClick={() => setShowJsonForm(false)}
                disabled={loading && showJsonForm}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* 错误显示 */}
      {error && (
        <div className="md-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      {/* 服务器列表 */}
      <div className="mcp-servers-list">
        {Object.entries(servers).length === 0 ? (
          <div className="md-empty-state">
            <div className="md-empty-state-icon">🔧</div>
            <div className="md-empty-state-text">暂无MCP服务器</div>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              添加MCP服务器以启用AI工具功能
            </p>
          </div>
        ) : (
          Object.entries(servers).map(([name, config]) => (
            <div key={name} className={`md-mcp-item ${config.type === 'streamable-http' ? 'mcp-server-streamable' : ''}`}>
              <div className="mcp-item-header">
                <div className="md-mcp-info">
                  <div className="md-mcp-name">
                    <span 
                      className={`md-status-indicator ${
                        isServerConnected(name) ? 'online' : 'offline'
                      }`}
                    />
                    {name}
                  </div>
                  <div className="md-mcp-command">
                    {config.type === 'streamable-http' ? (
                      <span style={{ color: 'var(--md-sys-color-primary)' }}>
                        🌐 {config.url}
                      </span>
                    ) : (
                      <>
                        {config.command} {config.args?.join(' ') || ''}
                      </>
                    )}
                  </div>
                  <div className="md-mcp-type">
                    <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {config.type === 'streamable-http' ? 'HTTP流' : 'Stdio命令'}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="mcp-item-actions">
                <button
                  className={`md-button mcp-control-btn ${
                    isServerConnected(name) ? '' : 'md-button-outline'
                  }`}
                  onClick={() => handleConnectServer(name)}
                  disabled={loading}
                >
                  {isServerConnected(name) ? '已连接' : '连接'}
                </button>
                
                <button
                  className="md-button mcp-delete-btn"
                  onClick={() => handleDeleteServer(name)}
                  disabled={loading}
                  title="删除服务器"
                >
                  ❌
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="md-loading">
          <div>⏳ 处理中...</div>
        </div>
      )}
    </div>
  );
};

export default MCPSidebar;