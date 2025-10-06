import React, { useState, useContext, createContext } from 'react';

// 双语翻译系统
const translations = {
  zh: {
    // 导航
    appTitle: '02agent',
    chat: '聊天',
    settings: '设置',
    help: '帮助',
    language: '语言',
    
    // AI信息
    aiAssistant: '02agent AI助手',
    aiDescription: '由0.2studio开发的智能AI助手',
    aiDevelopedBy: '开发者：0.2studio',
    aiModel: 'AI模型',
    
    // API状态
    apiNotStarted: 'API服务器未启动',
    apiNotStartedDesc: '请下载02agentAPP并启动，或运行 npm run api 启动服务器',
    checkingApi: '正在检查API状态...',
    apiConnected: 'API已连接',
    apiDisconnected: 'API连接断开',
    
    // 聊天页面
    newSession: '新会话',
    importSessions: '导入会话',
    noSessions: '暂无会话',
    sessionName: '会话名称',
    messages: '消息',
    createTime: '创建时间',
    lastMessage: '最后消息',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    confirmDelete: '确定要删除这个会话吗？',
    deleteSuccess: '会话已删除',
    exportSessions: '导出会话',
    importSuccess: '导入成功',
    
    // 聊天输入
    typeMessage: '输入消息...',
    send: '发送',
    streamingResponse: '流式响应',
    connecting: '正在连接...',
    
    // MCP管理
    mcpServers: 'MCP服务器',
    addMCPServer: '添加MCP服务器',
    serverName: '服务器名称',
    command: '命令',
    args: '参数',
    add: '添加',
    startAll: '启动所有',
    stopAll: '停止所有',
    serverAdded: '服务器已添加',
    serverDeleted: '服务器已删除',
    
    // 设置页面
    aiSettings: 'AI设置',
    apiKey: 'API密钥',
    baseUrl: '基础URL',
    model: '模型',
    update: '更新',
    configUpdated: '配置已更新',
    
    // 状态
    online: '在线',
    offline: '离线',
    connected: '已连接',
    disconnected: '已断开',
    
    // 错误和状态
    error: '错误',
    networkError: '网络错误',
    invalidJson: 'JSON格式错误',
    requiredFields: '请填写所有必填字段',
    
    // 工具调用
    callingTool: '正在调用工具',
    toolCallComplete: '工具调用完成',
    toolCallError: '工具调用错误',
    
    // 关于
    about: '关于',
    about02agent: '关于02agent',
    aboutDescription: '02agent是由0.2studio开发的智能AI助手平台，集成多种MCP工具，为用户提供强大的AI交互体验。',
    
    // 聊天状态
    loadingMessages: '加载消息中...',
    startConversation: '开始对话',
    firstMessageHint: '输入您的第一条消息，AI助手将为您提供帮助',
    replying: '回复中',
    aiReplying: 'AI正在回复中...',
    
    // MCP操作
    addMCPJsonConfig: '添加MCPjson配置',
    refreshStatus: '刷新状态',
    refreshMCPStatus: '刷新MCP状态',
    toolList: '工具列表',
    availableTools: '可用工具',
    noToolsAvailable: '暂无可用工具',
    serverAlreadyConnected: '服务器已连接',
    serverConnected: '服务器已连接',
    serverDisconnected: '服务器已断开',
    disconnecting: '正在断开连接...',
    disconnectSuccess: '断开连接成功',
    connectSuccess: '连接成功',
    connectionFailed: '连接失败',
    
    // Errors and Status (never timeout version)
    streamInterrupted: 'AI reply was interrupted, please try again',
    connectionLost: 'Connection lost, please check network connection',
    waitingForResponse: 'Waiting for AI response, please wait...'
  },
  en: {
    // 导航
    appTitle: '02agent',
    chat: 'Chat',
    settings: 'Settings',
    help: 'Help',
    language: 'Language',
    
    // AI Info
    aiAssistant: '02agent AI Assistant',
    aiDescription: 'Intelligent AI assistant developed by 0.2studio',
    aiDevelopedBy: 'Developed by: 0.2studio',
    aiModel: 'AI Model',
    
    // API Status
    apiNotStarted: 'API Server Not Started',
    apiNotStartedDesc: 'Please download 02agentAPP and start it, or run npm run api to start the server',
    checkingApi: 'Checking API status...',
    apiConnected: 'API Connected',
    apiDisconnected: 'API Disconnected',
    
    // Chat Page
    newSession: 'New Session',
    importSessions: 'Import Sessions',
    noSessions: 'No Sessions',
    sessionName: 'Session Name',
    messages: 'Messages',
    createTime: 'Create Time',
    lastMessage: 'Last Message',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this session?',
    deleteSuccess: 'Session deleted successfully',
    exportSessions: 'Export Sessions',
    importSuccess: 'Import successful',
    
    // Chat Input
    typeMessage: 'Type a message...',
    send: 'Send',
    streamingResponse: 'Streaming Response',
    connecting: 'Connecting...',
    
    // MCP Management
    mcpServers: 'MCP Servers',
    addMCPServer: 'Add MCP Server',
    serverName: 'Server Name',
    command: 'Command',
    args: 'Arguments',
    add: 'Add',
    startAll: 'Start All',
    stopAll: 'Stop All',
    serverAdded: 'Server added successfully',
    serverDeleted: 'Server deleted successfully',
    
    // Settings Page
    aiSettings: 'AI Settings',
    apiKey: 'API Key',
    baseUrl: 'Base URL',
    model: 'Model',
    update: 'Update',
    configUpdated: 'Configuration updated successfully',
    
    // Status
    online: 'Online',
    offline: 'Offline',
    connected: 'Connected',
    disconnected: 'Disconnected',
    
    // Errors
    error: 'Error',
    networkError: 'Network Error',
    invalidJson: 'Invalid JSON format',
    requiredFields: 'Please fill in all required fields',
    
    // Tool Calls
    callingTool: 'Calling tool',
    toolCallComplete: 'Tool call completed',
    toolCallError: 'Tool call error',
    
    // About
    about: 'About',
    about02agent: 'About 02agent',
    aboutDescription: '02agent is an intelligent AI assistant platform developed by 0.2studio, integrating multiple MCP tools to provide users with a powerful AI interaction experience.',
    
    // Chat Status
    loadingMessages: 'Loading messages...',
    startConversation: 'Start Conversation',
    firstMessageHint: 'Type your first message, and the AI assistant will help you',
    replying: 'Replying',
    aiReplying: 'AI is replying...',
    
    // MCP Operations
    addMCPJsonConfig: 'Add MCP JSON Config',
    refreshStatus: 'Refresh Status',
    refreshMCPStatus: 'Refresh MCP Status',
    toolList: 'Tool List',
    availableTools: 'Available Tools',
    noToolsAvailable: 'No tools available',
    serverAlreadyConnected: 'Server already connected',
    serverConnected: 'Server connected',
    serverDisconnected: 'Server disconnected',
    disconnecting: 'Disconnecting...',
    disconnectSuccess: 'Disconnected successfully',
    connectSuccess: 'Connected successfully',
    connectionFailed: 'Connection failed',
    
    // Errors and Status
    streamTimeout: 'AI reply timeout, please check network connection or try again later',
    streamInterrupted: 'AI reply was interrupted, please try again',
    noDataReceived: 'AI reply data stream interrupted, please try again'
  }
};

// 语言上下文
const LanguageContext = createContext();

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh');
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义hook使用翻译
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
};

export { LanguageContext };