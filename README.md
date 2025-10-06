# 02agent Web 前端应用

## 项目概述

02agent Web 是一个基于React框架开发的现代化前端应用，提供完整的AI Agent交互界面。该应用支持双语切换、实时流式聊天、MCP服务器管理、会话管理等核心功能。

## 🎯 核心功能

### 1. **智能API检测与连接**
- 自动检测本地API服务器状态（通过/health端点）
- 友好的连接状态提示和重试机制
- 实时连接状态监控

### 2. **双语界面支持**
- 中文/英文无缝切换
- 完整的国际化翻译系统
- 语言偏好本地存储

### 3. **现代化UI设计**
- Material Design 3设计规范
- 主题色 #00948A 贯穿整个应用
- 响应式布局，支持移动端
- 流畅的动画和过渡效果

### 4. **三栏式布局**
- **左侧栏**：会话管理（创建、编辑、删除、导入/导出）
- **中间栏**：聊天界面（支持流式输出）
- **右侧栏**：MCP服务器管理（添加、连接、状态监控）

### 5. **高级聊天功能**
- 真实的流式输出（Server-Sent Events）
- 完整的上下文对话管理
- 消息时间戳显示
- 工具调用状态提示

### 6. **MCP服务器管理**
- 动态添加/删除MCP服务器
- 实时连接状态监控
- 批量启动/停止功能
- JSON配置验证

### 7. **会话数据管理**
- 完整的CRUD操作
- JSON格式导入/导出
- 会话名称编辑
- 数据持久化

### 8. **AI配置管理**
- API密钥安全存储
- Base URL自定义
- 模型选择配置
- 配置验证和更新

## 🏗️ 技术架构

### 前端技术栈
- **React 18.2.0**: 现代化UI框架
- **React Router 6.8.0**: 客户端路由
- **Material Design 3**: 设计语言系统
- **Context API**: 状态管理
- **CSS3 + Flexbox**: 响应式布局

### 核心依赖
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "@material/web": "^1.0.0"
}
```

## 📁 项目结构

```
frontend/02agent-web/
├── public/
│   ├── index.html          # 主HTML文件
│   ├── ico.png            # 应用图标
│   └── favicon.ico        # 网站图标
├── src/
│   ├── components/        # React组件
│   │   ├── Navigation.js       # 主导航栏
│   │   ├── ApiStatusCheck.js   # API状态检测
│   │   ├── SessionList.js      # 会话列表
│   │   ├── ChatArea.js         # 聊天区域
│   │   └── MCPSidebar.js       # MCP管理面板
│   ├── pages/            # 页面组件
│   │   ├── ChatPage.js        # 聊天主页面
│   │   └── SettingsPage.js    # 设置页面
│   ├── contexts/         # React Context
│   │   ├── LanguageContext.js # 语言国际化
│   │   └── APIContext.js      # API状态管理
│   ├── App.js            # 主应用组件
│   ├── App.css           # 应用样式
│   ├── index.js          # 应用入口
│   └── index.css         # 全局样式
├── package.json          # 项目配置
└── README.md            # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js ≥ 16.0.0
- npm 或 yarn
- 本地API服务器（02agent后端，端口3000）

### 安装依赖
```bash
cd frontend/02agent-web
npm install
```

### 启动开发服务器（端口3001）
```bash
# 方法1：直接指定端口
PORT=3001 npm start

# 方法2：使用环境变量文件
echo "PORT=3001" > .env
npm start

# 方法3：Windows系统
set PORT=3001 && npm start
```

前端应用将在 http://localhost:3001 启动

### 构建生产版本
```bash
npm run build
```

## 📋 使用指南

### 1. 首次启动
1. 确保后端API服务器已启动（`npm run api`，端口3000）
2. 打开前端应用，系统会自动检测API连接
3. 如果API未启动，会显示友好的错误提示和重试机制

### 2. 基本使用流程
1. **创建会话**: 点击"新会话"按钮创建聊天会话
2. **配置AI**: 进入设置页面配置API密钥和模型
3. **添加MCP服务器**: 在右侧面板添加需要的MCP服务器
4. **开始聊天**: 在聊天界面输入消息，支持流式响应

### 3. 高级功能
- **会话管理**: 支持重命名、删除、导入/导出会话
- **MCP管理**: 动态添加/删除服务器，批量操作
- **双语切换**: 点击右上角语言按钮切换中英文
- **数据导出**: 一键导出所有会话数据为JSON

## 🎨 UI设计规范

### 主题色彩
- **主色**: #00948A (Teal)
- **辅色**: #4A635F (Dark Teal)
- **背景**: #FAFDFB (Off-white)
- **表面**: #FFFFFF (White)
- **错误**: #BA1A1A (Red)

### 字体系统
- **主字体**: Roboto (英文)
- **中文字体**: Noto Sans SC
- **等宽字体**: 系统默认monospace

### 间距规范
- **基础间距**: 8px
- **组件间距**: 16px
- **页面间距**: 24px
- **大间距**: 32px

## 🔧 API接口集成

### 核心API端点
```javascript
// 健康检查
GET /health

// AI配置
GET /api/ai/config
POST /api/ai/config

// MCP管理
GET /api/mcp/config
PUT /api/mcp/servers/:name
DELETE /api/mcp/servers/:name
POST /api/mcp/connect
GET /api/mcp/status

// 会话管理
POST /api/chat/sessions
GET /api/chat/sessions
GET /api/chat/sessions/:id
DELETE /api/chat/sessions/:id

// 消息处理
POST /api/chat/:sessionId/message  // 支持流式
POST /api/chat/query               // 直接查询

// 数据导入导出
GET /api/chat/sessions/export
POST /api/chat/sessions/import
```

### 流式响应处理
```javascript
const response = await sendMessage(sessionId, message, true);
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'chunk') {
        // 处理流式内容
        updateStreamingContent(data.content);
      }
    }
  }
}
```

## 🌍 国际化支持

### 翻译系统架构
- **语言文件**: `src/contexts/LanguageContext.js`
- **翻译函数**: `t('key')`
- **语言切换**: 自动保存到localStorage
- **默认语言**: 中文（zh）

### 翻译示例
```javascript
// 定义翻译
const translations = {
  zh: { welcome: '欢迎使用' },
  en: { welcome: 'Welcome' }
};

// 使用翻译
const { t } = useTranslation();
return <h1>{t('welcome')}</h1>;
```

## 📱 响应式设计

### 断点设置
- **移动端**: < 768px
- **平板端**: 768px - 1024px
- **桌面端**: > 1024px

### 移动端适配
- 三栏布局变为垂直堆叠
- 侧边栏变为可折叠
- 按钮和输入框尺寸调整
- 字体大小优化

## 🔒 安全考虑

### API密钥安全
- 密码输入框类型
- 前端不显示完整密钥
- HTTPS传输（生产环境）
- 本地存储加密

### 输入验证
- JSON格式验证
- XSS防护
- SQL注入防护（后端）
- 文件上传类型检查

## 🐛 错误处理

### 错误类型
- **网络错误**: 自动重试机制
- **API错误**: 友好提示信息
- **格式错误**: 实时验证反馈
- **权限错误**: 清晰的操作指引

### 错误示例
```javascript
try {
  await apiCall();
} catch (error) {
  setError(error.message);
  // 显示用户友好的错误信息
  showNotification('操作失败：' + error.message, 'error');
}
```

## 🚀 性能优化

### 优化策略
- **懒加载**: 组件按需加载
- **虚拟滚动**: 大量消息列表优化
- **防抖节流**: 输入和API调用优化
- **缓存策略**: 会话数据本地缓存

### 内存管理
- 及时清理事件监听器
- 组件卸载时取消请求
- 避免内存泄漏
- 合理使用useEffect

## 📊 浏览器兼容性

### 支持浏览器
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11（有限支持）

### 特性检测
```javascript
// 流式响应支持检测
if (typeof ReadableStream === 'undefined') {
  // 降级到非流式响应
  return await sendMessage(sessionId, message, false);
}
```

## 🔧 开发指南

### 代码规范
- ESLint配置
- Prettier格式化
- Git提交规范
- 组件命名规范

### 调试工具
- React Developer Tools
- Redux DevTools（如使用）
- Network面板
- Console日志

### 测试策略
- 单元测试：Jest + React Testing Library
- 集成测试：Cypress
- 端到端测试：Playwright

## 📝 部署指南

### 开发环境
```bash
npm start          # 启动开发服务器（端口3001）
npm run build      # 构建生产版本
npm test           # 运行测试
```

### 生产部署
1. 构建生产版本：`npm run build`
2. 配置Web服务器（Nginx/Apache）
3. 设置反向代理到API服务器（端口3000）
4. 配置HTTPS证书
5. 启用Gzip压缩

### Docker部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build/ ./build/
EXPOSE 3001
CMD ["npx", "serve", "-s", "build", "-l", "3001"]
```

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request
5. 代码审查和合并

### 代码规范
- 遵循React最佳实践
- 使用函数组件和Hooks
- 保持组件纯净
- 添加必要的注释

### 更新日志
关注GitHub releases获取最新版本信息

---

**02agent Web** - 现代化的AI Agent前端解决方案

*让AI交互更简单、更美观、更强大！*