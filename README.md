# 鼎创财富中心周边租房决策地图 v2.0

## 目标
固定网址 + 动态 JSON 数据 + 手机可打开 + Point ID 与每日监控通知一致。

硬条件：
- 一室一厅整租
- 月租 ≤ 3000 元
- 5km 内，优先 0–2km
- 独立入户、独立厨卫
- 优先普通住宅、民水民电、国家电网直缴

## 目录
- `index.html`：主页面
- `app.js`：地图/筛选/房源详情逻辑
- `styles.css`：样式
- `data/rentals.json`：房源级数据库（以后最常更新）
- `data/communities.json`：小区数据库
- `data/dingchuang.json`：鼎创财富中心中心点
- `.github/workflows/pages.yml`：GitHub Pages 自动部署
- `manifest.webmanifest` + `sw.js`：手机端/PWA基础

## 一次性上线步骤
1. 把本包所有文件上传到 `CocopulpZ/dingchuang-rent-map` 仓库根目录。
2. GitHub 仓库 `Settings → Pages`。
3. `Build and deployment → Source` 选择 `GitHub Actions`。
4. 等待 `Actions` 中 `Deploy GitHub Pages` 成功。
5. 固定网址将是：
   `https://cocopulpz.github.io/dingchuang-rent-map/`

## 以后如何更新
只要修改并提交：
`data/rentals.json`
Pages 会自动重新部署，网址不变。

## Point ID
- `C-xxx`：小区
- `R-xxx`：具体房源
每日 09:00 / 18:00 通知使用同一个 `R-xxx`，可以和地图直接对应。

## 房源状态
`NEW / ACTIVE / PRICE_DOWN / PRICE_UP / UPDATED / POSSIBLY_OFFLINE / OFFLINE / RELISTED`

## 每日通知模板
### 地图更新摘要
- 时间：
- 新增：
- 降价：
- 状态变化：
- 当前最值得联系：

### 单套房源
- Point ID：
- 状态：
- 小区：
- 月租：
- 面积 / 朝向：
- 公交/地铁：分钟 / 站数 / 换乘（未核实写“待核”）
- 住宅/商办：
- 水电：
- 独立入户：
- 独立厨卫：
- 来源更新时间：
- 推荐等级：
- 一句话判断：
- 房源原页：
- 高德公交：
- 高德骑行：

## 重要边界
当前 ChatGPT 的自动监控可以持续输出结构化更新，但若没有 GitHub Contents 写权限，它不能直接替你提交 `rentals.json` 到仓库。
因此 v2.0 先解决“固定网址 + 数据结构 + 自动部署”；后续再接具备写权限的数据更新通道。
