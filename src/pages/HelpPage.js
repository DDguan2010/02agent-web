import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const HelpPage = ({ onBack }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`help-page ${onBack ? 'standalone' : ''}`}>
      <div className="md-container">
        {onBack && (
          <div style={{ marginBottom: '16px' }}>
            <button 
              onClick={onBack}
              className="md-button"
              style={{ 
                background: 'var(--md-sys-color-surface-variant)',
                color: 'var(--md-sys-color-on-surface-variant)'
              }}
            >
              ← 返回
            </button>
          </div>
        )}
        <div className="md-card">
          <h2 className="md-settings-title">使用方法</h2>
          
          <div className="help-content">
            <div className="help-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>下载02agentAPP</h3>
                <p>
                  <a 
                    href="https://wwuc.lanzoub.com/b00eg5m72d" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    https://wwuc.lanzoub.com/b00eg5m72d
                  </a>
                </p>
                <p className="step-note">密码: 02</p>
                <h3>下载完成后，解压，打开文件夹“环境安装”，双击“双击安装环境.bat”安装环境。完成后双击02AgentAPP.exe启动服务</h3>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>配置AI API</h3>
                <p>打开网页端，点击"设置"并填写自己的AI API</p>
                <div className="step-details">
                  <p>• 支持OpenAI、DeepSeek等主流AI服务</p>
                  <p>• 需要填写API密钥、基础URL和模型名称</p>
                  <p>• 配置完成后即可开始使用</p>
                </div>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>开始使用</h3>
                <p>配置完成后，您可以：</p>
                <div className="step-details">
                  <p>• 与AI助手进行对话</p>
                  <p>• 管理多个会话</p>
                  <p>• 使用MCP工具扩展功能</p>
                  <p>• 导出和导入会话记录</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="help-footer">
            <p>如有问题，请检查网络连接或重新配置API设置。</p>
          </div>
        </div>
        
        {/* 常见问题 */}
        <div className="md-card">
          <h3 className="md-settings-title">常见问题</h3>
          <div className="help-content">
            <div className="help-step">
              <div className="step-number">❓</div>
              <div className="step-content">
                <h3>API连接失败怎么办？</h3>
                <p>请检查以下几点：</p>
                <div className="step-details">
                  <p>• 确认02agentAPP已启动</p>
                  <p>• 检查网络连接是否正常</p>
                  <p>• 确认防火墙没有阻止应用</p>
                  <p>• 尝试重启02agentAPP</p>
                </div>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">🔑</div>
              <div className="step-content">
                <h3>API密钥无效怎么办？</h3>
                <p>请确认您的API密钥：</p>
                <div className="step-details">
                  <p>• 密钥格式正确（以sk-开头）</p>
                  <p>• 密钥没有过期</p>
                  <p>• 账户有足够的额度</p>
                  <p>• 使用了正确的API服务商</p>
                </div>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">🌐</div>
              <div className="step-content">
                <h3>基础URL应该填什么？</h3>
                <p>根据您的AI服务商选择：</p>
                <div className="step-details">
                  <p>• OpenAI官方：https://api.openai.com/v1</p>
                  <p>• Azure OpenAI：https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT</p>
                  <p>• 第三方服务：请参考对应文档</p>
                  <p>• 本地服务：http://localhost:11434/v1</p>
                </div>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">🤖</div>
              <div className="step-content">
                <h3>如何选择AI模型？</h3>
                <p>常见模型选择建议：</p>
                <div className="step-details">
                  <p>• GPT-4o：综合能力最强，适合复杂任务</p>
                  <p>• GPT-3.5-turbo：速度快，成本低，适合日常对话</p>
                  <p>• Claude-3：长文本处理能力强</p>
                  <p>• Gemini：多模态支持好</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 高级设置 */}
        <div className="md-card">
          <h3 className="md-settings-title">高级设置</h3>
          <div className="help-content">
            <div className="help-step">
              <div className="step-number">⚙️</div>
              <div className="step-content">
                <h3>MCP服务器配置</h3>
                <p>MCP（Model Context Protocol）服务器可以扩展AI功能：</p>
                <div className="step-details">
                  <p>• 文件系统工具：让AI可以读写文件</p>
                  <p>• 网络工具：让AI可以访问网页</p>
                  <p>• 数据库工具：让AI可以查询数据库</p>
                  <p>• 自定义工具：根据需求开发专用工具</p>
                </div>
              </div>
            </div>
            
            <div className="help-step">
              <div className="step-number">🔄</div>
              <div className="step-content">
                <h3>会话管理</h3>
                <p>有效管理您的AI对话：</p>
                <div className="step-details">
                  <p>• 创建新会话：开始新的对话主题</p>
                  <p>• 编辑会话名称：更好地组织对话</p>
                  <p>• 导出会话：保存重要对话记录</p>
                  <p>• 导入会话：恢复之前的对话</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 关于信息 */}
        <div className="md-card">
          <h3 className="md-settings-title">关于02agent</h3>
          <div className="about-content">
            <p>{t('aboutDescription')}</p>
            <div className="about-info">
              <p><strong>开发者：</strong>0.2studio</p>
              <p><strong>版本：</strong>1.0.0</p>
              <p><strong>功能：</strong>智能对话、MCP工具集成、会话管理</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;