# WSL-构建镜像并部署到服务器

# WSL 本地构建镜像并部署到远程服务器指南

本文档整理了在 **WSL** 中构建 `new-api` 镜像、测试、更新镜像以及传输到远程低配置服务器（2核1G）的完整流程。

---

## 1. 前提条件

- WSL 中已同步最新仓库代码（含你修改的网页跳转功能）
- Docker 已安装并正常运行
- 服务器架构为 `x86_64`（amd64）
- 项目路径示例：`/mnt/d/Work/Projects/gitrepos/new-api`

---

## 2. 在 WSL 中构建镜像

```bash
cd /mnt/d/Work/Projects/gitrepos/new-api

# 构建最新镜像
docker buildx build --platform linux/amd64 \
  --build-arg DISABLE_ESLINT_PLUGIN=true \
  -t new-api:local \
  --load .

# 保存为 tar 文件（每次更新后都要重新生成）
docker save -o new-api-local.tar new-api:local

ls -lh new-api-local.tar
```

---

## 3. 在 WSL 中测试镜像（强烈推荐）

### 3.1 `docker-compose.yml` 配置（测试用）

```yaml
new-api:
image: new-api:local
    # build: .                     # 必须注释掉！
container_name: new-api-test
restart: unless-stopped
command: --log-dir /app/logs
ports:
-"3000:3000"
volumes:
- ./data:/data
- ./logs:/app/logs
environment:
- SQL_DSN=postgresql://root:123456@postgres:5432/new-api
- REDIS_CONN_STRING=redis://:123456@redis:6379
- TZ=Asia/Shanghai
- ERROR_LOG_ENABLED=true
- BATCH_UPDATE_ENABLED=true
- NODE_NAME=new-api-node-1
depends_on:
- redis
- postgres
networks:
- new-api-network
```

### 3.2 测试命令

```bash
docker compose up -d
docker compose logs -f new-api
docker compose ps
curl -s http://localhost:3000/api/status | jq
```

**测试通过后再上传到服务器。**

---

## 4. 更新镜像到远程服务器（最新流程）

当你在 WSL 中更新了代码并重新构建镜像后，按以下步骤操作：

### 4.1 WSL 端操作

```bash
# 重新构建最新镜像
docker buildx build --platform linux/amd64 --build-arg DISABLE_ESLINT_PLUGIN=true -t new-api:local --load .

# 重新打包
docker save -o new-api-local.tar new-api:local

# 上传到服务器
scp new-api-local.tar username@服务器IP:/root/
```

### 4.2 远程服务器更新镜像（**安全方式**）

```bash
cd /你的项目目录

# 1. 停止当前容器（重要但安全，默认不会删数据）
docker compose down

# 2. 删除旧镜像（确保加载最新版）
docker rmi new-api:local

# 3. 加载最新镜像
docker load -i /root/new-api-local.tar

# 4. 启动（恢复环境）
docker compose up -d

# 5. 查看日志
docker compose logs -f new-api
```

> **重要说明**：`docker compose down` **默认不会删除你的数据库和配置数据**（`pg_data` volume 是持久化的）。只有使用 `docker compose down -v` 才会删除数据卷。请勿随意加 `-v` 参数。
> 

---

## 5. 恢复环境专用命令

如果环境异常，需要快速恢复：

```bash
cd /你的项目目录

# 直接启动（推荐）
docker compose up -d

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f new-api
```

---

## 6. 常用命令汇总

**核心命令（必须记住）：**

```bash
# 安全更新镜像流程
docker compose down          # 停止容器（保留数据）
docker rmi new-api:local     # 删除旧镜像
docker load -i new-api-local.tar
docker compose up -d         # 启动最新镜像

# 查看状态
docker compose ps
docker compose logs -f new-api
docker images | grep new-api

# 危险命令（谨慎使用）
docker compose down -v       # 会删除所有数据卷（包括数据库！）
```

---

## 7. 低配置服务器注意事项（2核1G）

- 必须**先在 WSL 测试通过**后再推送到服务器
- 不要随意使用 `docker compose down -v`
- 生产环境必须修改所有默认密码
- 可考虑增加 Swap 空间
- 可关闭部分功能降低内存占用（如 `BATCH_UPDATE_ENABLED=false`）

---

## 8. 常见问题

**Q: 执行了 `docker compose down` 后数据没了怎么办？**

A: 大概率数据还在。执行 `docker compose up -d` 即可恢复。如果数据库真的丢失，需要从备份恢复。

**Q: 新修改的网页功能没生效？**

A: 确认重新构建了镜像（`docker buildx build ...`），并执行了 `docker rmi` 删除旧镜像后再 `docker load`。

**Q: 想使用带版本号的镜像避免混淆？**

A: 使用 `new-api:v20250420` 这种 tag 更清晰。