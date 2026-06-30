# System Agent

Internal-only sidecar that gives the admin dashboard host-level visibility and a fixed
set of operations. **Never exposed publicly** — it lives on the internal Docker network
and is reached only by the Next.js app, server-side, authenticated with a shared secret.

## API

| Method | Path           | Auth | Purpose                                                        |
| ------ | -------------- | ---- | -------------------------------------------------------------- |
| GET    | `/healthz`     | no   | Liveness probe                                                 |
| GET    | `/metrics`     | yes  | Host disk usage, memory, CPU/load, uptime, container status    |
| POST   | `/ops/:name`   | yes  | Run one allowlisted operation                                  |

Auth header: `x-agent-secret: <AGENT_SECRET>` (timing-safe comparison).

### Operations (`/ops/:name`)

| Name             | Effect                                                                |
| ---------------- | --------------------------------------------------------------------- |
| `restart-service`| Restart an allowlisted container via the docker-socket-proxy (`{ service }`) |
| `redeploy`       | Dispatch `pipeline.yaml` (rebuild + deploy)                           |
| `backup`         | Dispatch `backup.yaml`                                                |
| `restore`        | Dispatch `restore.yaml` (`{ path }` → `s3_path`)                      |
| `system-update`  | Dispatch `update.yaml` (patch + restart services, reboot if required) |

Heavy/destructive operations are delegated to existing GitHub Actions workflows via
`workflow_dispatch`, so this process never holds the Ansible vault password, S3
credentials, or host root — only a fine-grained GitHub token (Actions: write, single
repo). The agent never spawns a shell.

## Environment

| Variable               | Required | Description                                                       |
| ---------------------- | -------- | ----------------------------------------------------------------- |
| `AGENT_SECRET`         | yes      | Shared secret (≥16 chars; use ≥32). Must match the app.           |
| `AGENT_PORT`           | no       | Listen port (default `8080`).                                     |
| `DOCKER_PROXY_URL`     | no       | e.g. `http://docker-socket-proxy:2375`. Needed for container metrics + restart. |
| `GITHUB_TOKEN`         | no       | Fine-grained PAT, Actions: write, single repo. Needed for dispatch ops. |
| `GITHUB_REPO`          | no       | `owner/repo`.                                                     |
| `GITHUB_REF`           | no       | Branch to dispatch on — `main` (prod) or `develop` (devt). Default `main`. |
| `ALLOWED_CONTAINERS`   | no       | Comma list of container names `restart-service` may restart.     |
| `DISK_PATHS`           | no       | Comma list of mount points to report (default `/`). Bind-mount host paths read-only. |
| `MEMINFO_PATH`         | no       | Path to `meminfo` (default `/proc/meminfo`).                      |
| `BACKUP_RETENTION_DAYS`| no       | Retention passed to the backup workflow (default `30`).          |

## Develop / build

```bash
npm install
npm run typecheck
npm run build && npm start   # or: npm run dev
```
