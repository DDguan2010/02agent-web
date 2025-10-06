# 02agent Web - 端口配置说明

## 端口配置

由于API服务使用3000端口，前端Web应用已配置为使用3001端口，避免端口冲突。

## 启动方式

### 开发环境
```bash
# 方法1：使用环境变量文件（推荐）
npm start

# 方法2：直接指定端口
PORT=3001 npm start

# 方法3：Windows系统
set PORT=3001 && npm start
```

### 生产环境
```bash
# 构建时自动使用环境变量
npm run build

# 或使用serve指定端口
serve -s build -l 3001
```

## 访问地址

- **前端应用**: http://localhost:3001
- **API服务**: http://localhost:3000

## 环境变量配置

项目根目录下的 `.env` 文件包含：
```
PORT=3001
```

## 端口冲突解决

如果遇到端口冲突，可以：

1. **修改前端端口**: 编辑 `.env` 文件
2. **修改API端口**: 修改后端服务端口
3. **使用不同端口**: 在package.json中修改scripts

## 部署配置

### Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端应用
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API服务
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker配置
```dockerfile
EXPOSE 3001
CMD ["npm", "start"]
```

## 验证端口

启动后可以通过以下方式验证：
```bash
# 检查端口占用
netstat -ano | findstr :3001

# 测试连接
curl http://localhost:3001/health
```