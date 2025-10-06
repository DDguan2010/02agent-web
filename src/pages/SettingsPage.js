import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAPI } from '../contexts/APIContext';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { aiConfig, updateAIConfig, getAIConfig } = useAPI();
  
  const [formData, setFormData] = useState({
    apiKey: '',
    baseURL: '',
    model: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // 加载当前配置
  useState(() => {
    if (aiConfig) {
      setFormData({
        apiKey: '', // API密钥不显示在前端
        baseURL: aiConfig.baseURL || '',
        model: aiConfig.model || ''
      });
    }
  }, [aiConfig]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage('');
      setMessageType('');
      
      const config = {};
      if (formData.apiKey) config.apiKey = formData.apiKey;
      if (formData.baseURL) config.baseURL = formData.baseURL;
      if (formData.model) config.model = formData.model;
      
      await updateAIConfig(config);
      
      setMessage(t('configUpdated'));
      setMessageType('success');
      
      // 清空API密钥输入框
      setFormData(prev => ({
        ...prev,
        apiKey: ''
      }));
      
      // 重新获取配置以更新显示
      await getAIConfig();
      
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="settings-page">
      <div className="md-container">
        <div className="md-card">
          <h2 className="md-settings-title">{t('aiSettings')}</h2>
          
          {message && (
            <div className={`md-${messageType}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="md-form-group">
              <label className="md-form-label">{t('apiKey')}</label>
              <input
                type="password"
                name="apiKey"
                className="md-text-field"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder={aiConfig?.hasApiKey ? "••••••••••••••••" : "sk-..."}
              />
              <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {aiConfig?.hasApiKey ? '已配置API密钥，留空则保持现有设置' : '请输入OpenAI API密钥'}
              </small>
            </div>
            
            <div className="md-form-group">
              <label className="md-form-label">{t('baseUrl')}</label>
              <input
                type="url"
                name="baseURL"
                className="md-text-field"
                value={formData.baseURL}
                onChange={handleInputChange}
                placeholder="https://api.openai.com/v1"
              />
              <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                AI API的基础URL
              </small>
            </div>
            
            <div className="md-form-group">
              <label className="md-form-label">{t('model')}</label>
              <input
                type="text"
                name="model"
                className="md-text-field"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="gpt-4o"
              />
              <small style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                使用的AI模型名称，如gpt-4o、gpt-3.5-turbo等
              </small>
            </div>
            
            <div className="md-button-group">
              <button 
                type="submit" 
                className="md-button"
                disabled={loading}
              >
                {loading ? '更新中...' : t('update')}
              </button>
              
              <button 
                type="button"
                className="md-button"
                onClick={getAIConfig}
                disabled={loading}
              >
                刷新配置
              </button>
            </div>
          </form>
          
          {aiConfig && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '12px',
                color: 'var(--md-sys-color-on-surface)'
              }}>
                当前配置
              </h3>
              <div style={{ 
                background: 'var(--md-sys-color-surface-variant)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                <div><strong>Base URL:</strong> {aiConfig.baseURL || '默认'}</div>
                <div><strong>Model:</strong> {aiConfig.model || '默认'}</div>
                <div><strong>API Key:</strong> {aiConfig.hasApiKey ? '✅ 已配置' : '❌ 未配置'}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 使用说明 */}
        <div className="md-card">
          <h3 className="md-settings-title">配置说明</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <p><strong>API密钥：</strong>您的AI API密钥，用于访问AI服务。请确保安全保存，不要泄露给他人。</p>
            <p><strong>基础URL：</strong>AI API的服务器地址。如果使用官方服务，保持默认即可；如果使用第三方服务，请填写对应地址。</p>
            <p><strong>模型：</strong>选择要使用的AI模型。不同模型有不同的能力和价格，常见选择包括gpt-4o、gpt-3.5-turbo等。</p>
            <p><strong>注意：</strong>修改配置后，新的设置将立即生效。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;