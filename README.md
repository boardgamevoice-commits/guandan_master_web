# 掼蛋大师 Web

线下掼蛋记分与规则辅助工具 — Web 端。

## 文档

- [Web 端 PRD](./docs/PRD-Web.md)
- iOS PRD V1.2 为功能对齐基准

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Vitest

## 部署

- **线上地址：** push 至 `main` 后自动部署至 GitHub Pages
- **仓库路径：** `https://github.com/<user>/guandan_master_web`
- **访问 URL：** `https://<user>.github.io/guandan_master_web/`

本地模拟 Pages 构建：

```bash
npm run build:pages
npm run preview
```

## 项目结构

```
src/
├── app/          # 路由与 Provider
├── components/   # UI 组件
├── domain/       # 算级、进贡等纯业务逻辑
├── pages/        # 页面
├── stores/       # 状态管理
├── types/        # 类型定义
└── utils/        # 工具函数
```

## 许可证

Private
