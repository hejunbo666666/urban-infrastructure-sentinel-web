# Urban Infrastructure Sentinel（前端）

面向移动端的**城市基础设施巡检** Web 应用：登录、上报问题、地图查看、我的记录与 PWA 离线能力。

## 用户使用步骤

1. **打开应用**  
   在浏览器中访问部署地址。未登录时会进入 **Sign in** 页面。

2. **登录**  
   输入账号、密码，点击 **Sign in**。登录成功后默认进入 **Report**（上报）页。

3. **提交一条上报（Report）**  
   - 填写 **Title**、选择 **Category**、填写 **Description**。  
   - 点击 **Use GPS location** 获取当前位置（经纬度与地址会显示在下方）。  
   - 可选：**Take photo** 或 **Choose from gallery** 添加图片（在线时才会上传）。  
   - 点击 **Submit report** 提交。  
   - 离线时：无图可排队保存，有图需联网或先去掉图片再提交；恢复网络后会自动尝试同步。

4. **在地图中查看（Map）**  
   底部点 **Map**，用 **Status** / **Category** 筛选，查看统计与点位；在地图上点击标记，下方 **Selected marker** 会显示摘要。

5. **我的（My）**  
   底部点 **My**，可看到当前账号与 **My reports** 数量；**Sign out** 退出登录。

6. **查看与管理记录**  
   - 在 **My** 中进入 **My reports**，浏览列表。  
   - **View details** 进入单条详情：可看描述、位置、照片，修改 **Status**（Pending / Processing / Resolved），或 **Delete**。  
   - 列表中也可用 **Pending / Processing / Resolved** 快速改状态。

7. **安装到主屏幕（可选）**  
   在 **Report** 页底部可点 **Install to home screen**（需 HTTPS 或 `localhost`；开发环境需在 `build` + `preview` 下测试；iOS 请用 Safari：**分享 → 添加到主屏幕**）。

8. **通知（可选）**  
   在 **Report** 页可点 **Enable notifications**，按浏览器提示授权（不支持时会提示）。

---

```bash
npm install
npm run dev
```

默认通过 `src/services/api.ts` 中的 `API_BASE_URL` 请求后端；修改接口地址请改该常量后重新构建。

```bash
npm run build    # 生产构建
npm run preview  # 本地预览构建结果（适合测 PWA 安装）
```

生成 PWA 所需图标（依赖 `public/logo.png`）：

```bash
npm run pwa:icons
```
