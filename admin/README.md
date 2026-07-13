# BookStation 管理后台

基于 React + Vite + Ant Design 6.x 构建的小说阅读站管理系统。

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:6003
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## ✨ 功能模块

### 📊 仪表盘
- 数据统计概览（用户数、小说数、章节数、阅读量）
- 最近注册用户列表
- 热门小说排行
- 系统运行状态监控

### 👥 用户管理
- 用户列表展示与搜索
- 新增/编辑用户信息
- 用户角色管理（管理员/作者/用户）
- 用户状态管理（正常/封禁/未激活）
- 密码重置功能

### 📚 书籍管理
- 小说列表展示与搜索
- 新增/编辑小说信息
- 小说分类管理
- 小说状态管理（连载中/已完结）
- 章节管理功能
- 封面图片上传

### 🕷️ 爬虫管理
- 爬虫列表展示与状态监控
- 启动/停止爬虫任务
- 爬虫配置管理
- 任务历史记录
- 实时日志查看
- 数据源连接测试

### ⚙️ 系统设置
- 网站基础配置
- 内容展示设置
- 安全策略配置
- 爬虫参数调整

## 🛠️ 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **UI 组件**: Ant Design 6.x
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **日期处理**: Day.js

## 📁 项目结构

```
admin/
├── src/
│   ├── layouts/          # 布局组件
│   │   └── MainLayout.jsx
│   ├── pages/            # 页面组件
│   │   ├── Login.jsx     # 登录页
│   │   ├── Dashboard.jsx # 仪表盘
│   │   ├── users/        # 用户管理
│   │   ├── books/        # 书籍管理
│   │   ├── crawler/      # 爬虫管理
│   │   └── Settings.jsx  # 系统设置
│   ├── routes/           # 路由配置
│   ├── store/            # 状态管理
│   │   └── auth.js
│   ├── api/              # API 接口
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── book.js
│   │   └── crawler.js
│   ├── utils/            # 工具函数
│   │   └── request.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🔧 环境配置

开发环境已配置代理，将 `/api` 请求转发到后端服务 `http://localhost:6001`。如需修改，请编辑 `vite.config.js`：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:6001',
    changeOrigin: true,
  },
}
```

## 📝 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 🔐 权限说明

- **管理员**: 拥有所有模块的完整权限
- **作者**: 可管理自己的小说和章节
- **用户**: 仅可浏览公开内容

## 📄 License

MIT License
