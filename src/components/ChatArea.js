import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const ChatArea = ({ session, onSessionUpdate }) => {
  const { t } = useTranslation();
  const { sendMessage, getChatSession, updateSessionName } = useAPI();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  
  // 加载会话消息
  useEffect(() => {
    if (session) {
      loadSessionMessages(session.sessionId);
    } else {
      setMessages([]);
    }
  }, [session]);
  
  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, currentToolCall]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadSessionMessages = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChatSession(sessionId);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [getChatSession]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    
    // 添加用户消息到本地状态
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // 只有在会话中没有消息时才更新会话名称（第一条消息）
    if (messages.length === 0 && !session.name) {
      await updateSessionName(session.sessionId, userMessage);
    }
    
    try {
      // 发送消息并获取流式响应
      const response = await sendMessage(session.sessionId, userMessage, true);
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // 开始流式处理
      setIsStreaming(true);
      setStreamingContent('');
      setCurrentToolCall(null);
      setError(null); // 清除之前的错误
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let currentTool = null;
      let lastChunkTime = Date.now();
      const HEARTBEAT_INTERVAL = 60000; // 心跳检测：60秒检查一次连接状态
      let heartbeatTimer = null;
      
      // 设置心跳检测，确保连接仍然活跃
      const startHeartbeat = () => {
        heartbeatTimer = setInterval(() => {
          const timeSinceLastChunk = Date.now() - lastChunkTime;
          if (timeSinceLastChunk > HEARTBEAT_INTERVAL * 2) {
            console.warn(`No data received for ${timeSinceLastChunk}ms, connection may be stale`);
            // 可以选择在这里添加连接检查逻辑，但继续等待
          }
        }, HEARTBEAT_INTERVAL);
      };
      
      const stopHeartbeat = () => {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      };
      
      // 开始心跳检测
      startHeartbeat();
      
      try {
        while (true) {
          // 永不设置超时，只进行普通的读取操作
          const { done, value } = await reader.read();
          
          if (done) {
            // 检查是否有未完成的回复
            if (isStreaming && fullContent.trim() === '') {
              throw new Error(t('streamInterrupted'));
            }
            break;
          }
          
          // 更新最后接收数据时间
          lastChunkTime = Date.now();
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'tool_call') {
                  // 工具调用开始 - 创建工具调用消息（只记录状态，不添加消息）
                  currentTool = {
                    id: data.tool_call.id,
                    name: data.tool_call.function?.name || '未知工具',
                    args: data.tool_call.function?.arguments || '{}',
                    status: 'calling'
                  };
                  setCurrentToolCall(currentTool);
                } else if (data.type === 'tool_call_complete') {
                  // 工具调用完成 - 添加合并的工具调用消息（只显示一次）
                  if (currentTool) {
                    const completedTool = {
                      ...currentTool,
                      status: 'completed',
                      result: data.result
                    };
                    setCurrentToolCall(null);
                    
                    // 添加合并的工具调用消息（无文字，只有样式部分）
                    const toolMessage = {
                      role: 'assistant',
                      content: '', // 空内容，只显示工具样式部分
                      timestamp: new Date().toISOString(),
                      toolCall: completedTool,
                      isToolMessage: true
                    };
                    setMessages(prev => [...prev, toolMessage]);
                  }
                } else if (data.type === 'complete') {
                } else if (data.type === 'complete') {
                  // 流式响应完成
                  fullContent = data.content;
                  setStreamingContent('');
                  setCurrentToolCall(null);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.log('Parse error:', e);
              }
            }
          }
        }
      } finally {
        // 确保停止心跳检测
        stopHeartbeat();
      }
      
      // 添加助手回复到消息列表（仅包含内容，不包含工具调用信息）
      if (fullContent) {
        const assistantMessage = {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      // 刷新会话列表以更新消息计数
      if (onSessionUpdate) {
        onSessionUpdate();
      }
      
    } catch (err) {
      setError(err.message);
      // 移除失败的用户消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setCurrentToolCall(null);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 自动调整textarea高度的函数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度以获取正确的scrollHeight
      textarea.style.height = 'auto';
      
      // 计算新的高度（最大8行，每行约20px）
      const lineHeight = 20;
      const maxRows = 8;
      const maxHeight = lineHeight * maxRows;
      
      // 设置新的高度，但不超过最大值
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = newHeight + 'px';
      
      // 如果内容超过最大行数，显示滚动条
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  };
  
  // 监听输入变化，自动调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);
  
  // 组件挂载时也调整一次高度
  useEffect(() => {
    adjustTextareaHeight();
  }, []);
  
  // Markdown渲染组件 - 仅用于AI消息
  const renderMarkdown = (content) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义代码块样式
          code({ inline, className, children, ...props }) {
            return !inline ? (
              <code className={`markdown-code ${className || ''}`} {...props}>
                {children}
              </code>
            ) : (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            );
          },
          // 自定义表格样式
          table({ children }) {
            return (
              <table className="markdown-table">
                {children}
              </table>
            );
          },
          // 自定义链接样式
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };
  
  // 普通文本渲染 - 用于用户消息
  const renderText = (content) => {
    return <span>{content}</span>;
  };
  
  // 工具调用信息显示组件 - 显示在消息下方
  const ToolCallDisplay = ({ toolCall, isCurrent }) => {
    return (
      <div className={`tool-call-display ${isCurrent ? 'current' : ''}`}>
        <div className="tool-call-header">
          <span className="tool-call-icon">🔧</span>
          <span className="tool-call-name">{toolCall.name}</span>
          <span className={`tool-call-status ${toolCall.status}`}>
            {toolCall.status === 'calling' ? '正在调用...' : '调用完成'}
          </span>
        </div>
        {toolCall.status === 'calling' && (
          <div className="tool-call-args">
            <small>参数: {toolCall.args}</small>
          </div>
        )}
        {toolCall.status === 'completed' && toolCall.result && (
          <div className="tool-call-result">
            <small>结果: {JSON.stringify(toolCall.result)}</small>
          </div>
        )}
      </div>
    );
  };
  
  if (!session) {
    return (
      <div className="chat-area empty-state">
        <div className="md-empty-state">
          <div className="md-empty-state-icon">💬</div>
          <div className="md-empty-state-text">{t('noSessions')}</div>
          <p style={{ marginBottom: '16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            请创建一个新会话开始聊天
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-area">
      {/* 会话头部 - 显示第一条消息作为名称和AI回复状态 */}
      <div className="chat-header">
        <div className="chat-header-main">
          <h3>{session.name || (messages.length > 0 ? messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '') : `会话 ${session.sessionId.slice(-6)}`)}</h3>
          {isStreaming && (
            <div className="ai-status-indicator">
              <span className="ai-status-dot"></span>
              <span className="ai-status-text">{t('aiReplying')}</span>
            </div>
          )}
        </div>
        <div className="chat-meta">
          {messages.length} {t('messages')}
          {isStreaming && <span className="streaming-indicator-small"> 📝 {t('replying')}</span>}
        </div>
      </div>
      
      {/* 消息区域 - 可滚动容器 */}
      <div className="md-chat-messages" ref={chatContainerRef}>
        {loading ? (
          <div className="md-loading">⏳ {t('loadingMessages')}</div>
        ) : messages.length === 0 ? (
          <div className="md-empty-state">
            <div className="md-empty-state-icon">🤖</div>
            <div className="md-empty-state-text">{t('startConversation')}</div>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {t('firstMessageHint')}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`md-message ${message.role} ${message.isToolMessage ? 'tool-message' : ''}`}>
                <div className={`md-message-bubble ${message.isToolMessage ? 'tool-bubble' : ''}`}>
                  {/* 工具消息且内容为空时不显示文字，只显示工具调用详情 */}
                  {message.isToolMessage && !message.content ? null : 
                   (message.role === 'assistant' && !message.isToolMessage ? renderMarkdown(message.content) : renderText(message.content))
                  }
                </div>
                {/* 工具调用详细信息 - 只在有工具调用时显示 */}
                {message.toolCall && (
                  <div className="tool-call-detail">
                    <ToolCallDisplay toolCall={message.toolCall} isCurrent={false} />
                  </div>
                )}
              </div>
            ))}
            
            {/* 当前工具调用显示 - 只在调用过程中显示，无文字 */}
            {currentToolCall && (
              <div className="md-message assistant tool-message">
                <ToolCallDisplay toolCall={currentToolCall} isCurrent={true} />
              </div>
            )}
            
            {/* 流式响应显示 */}
            {isStreaming && streamingContent && (
              <div className="md-message assistant">
                <div className="md-message-bubble">
                  {renderMarkdown(streamingContent)}
                  <span className="streaming-cursor">▋</span>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 错误显示 */}
      {error && (
        <div className="md-error">
          <strong>{t('error')}:</strong> {error}
        </div>
      )}
      
      {/* 输入区域 */}
      <div className="md-chat-input">
        <textarea
          ref={textareaRef}
          className="md-chat-textarea auto-resize"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeMessage')}
          disabled={isStreaming}
          rows="1"
        />
        <button
          className="md-button"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isStreaming || !session}
        >
          {t('send')}
        </button>
      </div>
      
      {/* 流式状态指示 */}
      {isStreaming && (
        <div className="streaming-indicator">
          <span className="streaming-text">{t('streamingResponse')}...</span>
          <span className="streaming-dots">...</span>
        </div>
      )}
    </div>
  );
};

export default ChatArea;