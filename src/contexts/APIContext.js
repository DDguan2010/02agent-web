import React, { useState, useEffect, useContext, createContext } from 'react';

// API基础配置 - 修改端口为3001
const API_BASE = 'http://localhost:3000';

// API上下文
const APIContext = createContext();

// API提供者组件
export const APIProvider = ({ children }) => {
  const [apiStatus, setApiStatus] = useState('checking'); // checking, connected, disconnected
  const [mcpStatus, setMcpStatus] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  
  // API健康检查
  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        return data;
      } else {
        setApiStatus('disconnected');
        throw new Error('API server not responding');
      }
    } catch (error) {
      setApiStatus('disconnected');
      throw error;
    }
  };
  
  // 获取AI配置
  const getAIConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/config`);
      if (!response.ok) throw new Error('Failed to get AI config');
      const data = await response.json();
      setAiConfig(data);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 更新AI配置
  const updateAIConfig = async (config) => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update AI config');
      const data = await response.json();
      setAiConfig(data.config);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 获取MCP配置
  const getMCPConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/config`);
      if (!response.ok) throw new Error('Failed to get MCP config');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  // 添加MCP服务器
  const addMCPServer = async (name, config) => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/servers/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to add MCP server');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  // 删除MCP服务器
  const deleteMCPServer = async (name) => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/servers/${name}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete MCP server');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  // 连接MCP服务器
  const connectMCPServers = async (servers = []) => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servers })
      });
      if (!response.ok) throw new Error('Failed to connect MCP servers');
      const data = await response.json();
      await getMCPStatus(); // 更新状态
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 断开MCP连接
  const disconnectMCPServers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/disconnect`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to disconnect MCP servers');
      const data = await response.json();
      await getMCPStatus(); // 更新状态
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 获取MCP状态 - 检查当前连接状态而非重新连接
  const getMCPStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mcp/status`);
      if (!response.ok) throw new Error('Failed to get MCP status');
      const data = await response.json();
      setMcpStatus(data);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 获取聊天会话
  const getChatSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions`);
      if (!response.ok) throw new Error('Failed to get chat sessions');
      const data = await response.json();
      setSessions(data.sessions);
      return data.sessions;
    } catch (error) {
      throw error;
    }
  };
  
  // 创建聊天会话 - 使用第一句话作为会话名称
  const createChatSession = async (firstMessage = null) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to create chat session');
      const data = await response.json();
      
      // 如果有第一条消息，用它作为会话名称
      if (firstMessage) {
        // 提取第一条消息的前50个字符作为会话名称
        const sessionName = firstMessage.length > 50 
          ? firstMessage.substring(0, 50) + '...' 
          : firstMessage;
        
        // 更新会话名称（本地状态）
        data.name = sessionName;
        
        // 更新会话列表中的名称
        const updatedSessions = sessions.map(session => 
          session.sessionId === data.sessionId 
            ? { ...session, name: sessionName }
            : session
        );
        setSessions([...updatedSessions, data]);
      } else {
        await getChatSessions(); // 刷新列表
      }
      
      setCurrentSession(data);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 获取会话详情
  const getChatSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to get chat session');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  // 更新会话名称（使用第一条消息）
  const updateSessionName = async (sessionId, firstMessage) => {
    try {
      // 提取第一条消息的前50个字符作为会话名称
      const sessionName = firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage;
      
      // 更新本地状态
      const updatedSessions = sessions.map(session => 
        session.sessionId === sessionId 
          ? { ...session, name: sessionName }
          : session
      );
      setSessions(updatedSessions);
      
      // 如果当前会话被更新，也更新当前会话
      if (currentSession && currentSession.sessionId === sessionId) {
        setCurrentSession({ ...currentSession, name: sessionName });
      }
      
      return sessionName;
    } catch (error) {
      throw error;
    }
  };
  
  // 删除会话
  const deleteChatSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete chat session');
      const data = await response.json();
      
      // 如果删除的是当前会话，清空当前会话
      if (currentSession && currentSession.sessionId === sessionId) {
        setCurrentSession(null);
      }
      
      await getChatSessions(); // 刷新列表
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 发送消息（支持流式）- 包含工具调用提示
  const sendMessage = async (sessionId, message, stream = false) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, stream })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      if (stream) {
        return response; // 返回Response对象用于流式处理
      } else {
        return await response.json();
      }
    } catch (error) {
      throw error;
    }
  };
  
  // 直接查询（无会话）
  const directQuery = async (query) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) throw new Error('Failed to send query');
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  // 导出会话
  const exportSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions/export`);
      if (!response.ok) throw new Error('Failed to export sessions');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-sessions-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  };
  
  // 导入会话
  const importSessions = async (sessionsData, merge = false) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/sessions/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: sessionsData, merge })
      });
      if (!response.ok) throw new Error('Failed to import sessions');
      const data = await response.json();
      await getChatSessions(); // 刷新列表
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // 初始化 - 检查MCP状态而非重新连接
  useEffect(() => {
    const init = async () => {
      try {
        await checkHealth();
        if (apiStatus === 'connected') {
          // 检查MCP状态而非重新连接
          const mcpData = await getMCPStatus();
          
          // 如果MCP已经连接，显示状态信息
          if (mcpData.connected) {
            console.log('MCP服务器已连接，工具数量:', mcpData.toolCount);
          } else {
            console.log('MCP服务器未连接，可以手动连接');
          }
          
          await Promise.all([
            getAIConfig(),
            getChatSessions()
          ]);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    init();
  }, []);
  
  return (
    <APIContext.Provider value={{
      apiStatus,
      mcpStatus,
      aiConfig,
      sessions,
      currentSession,
      setCurrentSession,
      checkHealth,
      getAIConfig,
      updateAIConfig,
      getMCPConfig,
      addMCPServer,
      deleteMCPServer,
      connectMCPServers,
      disconnectMCPServers,
      getMCPStatus,
      getChatSessions,
      createChatSession,
      getChatSession,
      updateSessionName,
      deleteChatSession,
      sendMessage,
      directQuery,
      exportSessions,
      importSessions
    }}>
      {children}
    </APIContext.Provider>
  );
};

// 自定义hook使用API
export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within APIProvider');
  }
  return context;
};

export { APIContext };