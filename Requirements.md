# 主题

## 主题名称

**Urban Infrastructure Sentinel（城市基础设施巡检员）**

中文可以叫：

> **城市设施巡检助手**

---

# 一、项目背景

城市中有很多公共设施：

- 路灯
- 垃圾桶
- 井盖
- 公园设备
- 公交站牌

这些设施可能出现：

- 损坏
- 倾倒
- 缺失
- 需要维护

本应用允许**市民或巡检人员**通过手机快速上报问题。

---

# 二、核心功能

### 1 GPS 自动定位

记录问题发生位置

navigator.geolocation.getCurrentPosition()

存储：

lat
lng
address

---

### 2 拍照上传（设备能力）

用户可以直接拍摄问题现场。

例如：

- 坏掉的路灯
- 破损井盖
- 倒下的路牌

<input type="file" accept="image/*" capture="environment" />

---

### 3 问题分类

例如：

| 分类   | 示例        |
| ------ | ----------- |
| 路灯   | 不亮 / 倾斜 |
| 垃圾桶 | 满了 / 损坏 |
| 道路   | 坑洞        |
| 井盖   | 缺失        |

---

### 4 文字描述

“这个井盖已经缺失好几天了，非常危险”

---

### 5 离线提交（PWA重点）

如果用户没有网络：

数据会存到

IndexedDB

当恢复网络：

自动同步服务器

这点 **老师会非常喜欢** 。

---

### 6 地图查看问题

使用

Leaflet
Google Maps
Mapbox

在地图上显示：

📍 已上报问题

---

### 7 状态跟踪

问题状态：

Pending
Processing
Resolved

用户可以查看进度。

---

# 三、技术架构

## 前端

React + PWA

React
Vite
Service Worker
IndexedDB
Leaflet Map

PWA能力：

离线访问
后台同步
Add to Home Screen
Push Notification

---

## 后端

简单 API：

.net web api

API 示例：

POST /report
GET /reports
PUT /report/:id/status

数据库：

mysql

---

# 四、数据结构

一共 **4 张表**

Users
Categories
Reports
ReportPhotos

关系：

Users
│
└── Reports
│
└── ReportPhotos

Reports
│
└── Categories

---

# 二、Users（用户表）

如果有登录功能就用，没有也可以保留。

CREATE TABLE users (
id VARCHAR(36) PRIMARY KEY,
username VARCHAR(50) NOT NULL,
email VARCHAR(100),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

示例：

| id | username | email           |
| -- | -------- | --------------- |
| u1 | alex     | [alex@email.com]() |

---

# 三、Categories（问题分类）

用于区分问题类型。

CREATE TABLE categories (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50) NOT NULL
);

示例数据：

| id | name         |
| -- | ------------ |
| 1  | Street Light |
| 2  | Road Damage  |
| 3  | Garbage      |
| 4  | Traffic Sign |

---

# 四、Reports（问题上报）

这是最核心的表。

CREATE TABLE reports (
id VARCHAR(36) PRIMARY KEY,

    user_id VARCHAR(36),
    category_id INT,

    title VARCHAR(200),
    description TEXT,

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    status VARCHAR(20) DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)

);

字段说明：

| 字段        | 作用     |
| ----------- | -------- |
| title       | 问题标题 |
| description | 问题描述 |
| latitude    | GPS 纬度 |
| longitude   | GPS 经度 |
| status      | 状态     |

状态示例：

pending
resolved

---

# 五、ReportPhotos（图片表）

一个问题可以有多张图片。

CREATE TABLE report_photos (
id VARCHAR(36) PRIMARY KEY,
report_id VARCHAR(36),
photo_url VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (report_id) REFERENCES reports(id)

);

示例：

| id | report_id | photo_url           |
| -- | --------- | ------------------- |
| p1 | r1        | /uploads/photo1.jpg |

---

# 六、完整ER关系

Users
│
└── Reports
│
└── ReportPhotos

Reports
│
└── Categories

---

# 七、数据流程（实际使用）

用户上报流程：

1 打开 PWA
2 获取 GPS
3 拍照
4 填写描述
5 提交

服务器保存：

Reports
↓
ReportPhotos

---

# 五、PWA功能（关键）

### Service Worker

缓存：

HTML
CSS
JS
API

---

### IndexedDB

存储离线数据：

offline_reports

---

### Background Sync

恢复网络自动发送：

navigator.serviceWorker.ready

---

# 八、开发进度记录（阶段一：前端 + PWA，已完成）

> 记录时间：2026-03-24
> 目的：用于测试阶段追踪，避免后续开发遗忘已实现内容。

## 1) 本阶段目标

在不接入后端 API 的前提下，先完成 React + PWA 前端闭环，覆盖：

- 问题上报页面
- GPS 定位
- 拍照上传入口
- 分类与描述
- 地图展示
- 状态跟踪
- 离线提交与恢复联网自动同步
- 可安装（Add to Home Screen）

## 2) 已实现功能清单（对应需求）

### 2.1 GPS 自动定位（已完成）

- 使用 `navigator.geolocation.getCurrentPosition()`
- 提交数据包含 `latitude`、`longitude`、`address`

### 2.2 拍照上传（已完成）

- 表单支持设备拍照入口：`<input type="file" accept="image/*" capture="environment" />`
- 当前阶段为前端本地展示与存储，后续后端阶段再接真实文件上传

### 2.3 问题分类（已完成）

- 预置分类：`Street Light`、`Road Damage`、`Garbage`、`Traffic Sign`
- 上报记录保存 `categoryId` 与 `categoryName`

### 2.4 文字描述（已完成）

- 支持 `title + description` 填写与校验

### 2.5 离线提交（PWA 重点，已完成）

- IndexedDB 中创建并使用：
  - `reports`（主记录）
  - `offline_reports`（离线待同步队列）
- 离线提交时写入队列
- 网络恢复后自动同步（`online` 事件 + Background Sync 注册）

### 2.6 地图查看问题（已完成）

- 使用 Leaflet 地图渲染上报点位
- Marker 弹窗展示标题、分类、状态

### 2.7 状态跟踪（已完成）

- 支持状态：`pending`、`processing`、`resolved`
- 可在底部表格中直接切换状态

### 2.8 页面布局（已完成）

- 采用传统业务页面结构
- 记录 table 放置在页面下部（底部区域）

## 3) PWA 能力落地（已完成）

- `manifest.webmanifest` 已配置
- `sw.js`（Service Worker）已实现缓存策略与基础离线能力
- 页面支持“下载到主屏幕”触发安装
- 支持通知权限开启与离线同步完成通知（浏览器支持时生效）

## 4) 当前数据存储策略（阶段一）

- 阶段一仅前端本地存储（IndexedDB）
- 暂未接入真实后端 API（符合当前开发约定）

## 5) 当前代码文件清单（阶段一新增/修改）

- `src/App.tsx`
- `src/db.ts`
- `src/types.ts`
- `src/main.tsx`
- `src/index.css`
- `index.html`
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icon-192.svg`
- `public/icon-512.svg`

## 6) 测试建议（你现在可执行）

1. 安装依赖：`npm install`
2. 本地启动：`npm run dev`
3. 功能测试：
   - 表单上报（标题/描述/分类）
   - GPS 定位获取
   - 拍照文件选择
   - 地图点位展示
   - 底部 table 状态切换
4. 离线测试：
   - 断网后提交，确认写入离线队列
   - 恢复网络后确认自动同步并更新同步状态
5. PWA 测试：
   - 检查 manifest 与 SW 是否生效
   - 测试“下载到主屏幕”

## 7) 下一阶段（待你确认测试通过后）

- 开发简单 `.NET Web API`
  - `POST /report`
  - `GET /reports`
  - `PUT /report/:id/status`
- 将当前“本地模拟同步”切换为“真实接口同步”
- 按需求对接 MySQL 表结构：`users`、`categories`、`reports`、`report_photos`