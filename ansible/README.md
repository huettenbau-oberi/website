# Ansible Playbooks

Automates initial VPS provisioning and zero-downtime application deployments for `huettenbau-oberi.ch`.

## Prerequisites

- Ansible ≥ 2.14
- SSH access to the VPS as `root`
- The `community.docker` collection:

```bash
ansible-galaxy collection install -r requirements.yml
```

## Setup

### 1. Inventory

Create an inventory file `inventory.ini` based on the example, filling in your VPS details:

```ini
[hetzner]
webserver ansible_host=YOUR_VPS_IP ansible_user=root ansible_port=YOUR_VPS_PORT ansible_ssh_private_key_file=~/.ssh/id_ed25519

[hetzner:vars]
ansible_python_interpreter=/usr/bin/python3
```

### 2. Environment file


`cloudflare.vault`

```ini
account_email=example@huettenbau-oberi.ch
api_token=EXAMPLE_HERE
```

`devt.env.vault`

```ini
DATABASE_URL=postgres://{{ pg_devt_user }}:{{ pg_devt_password }}@huettenbau-oberi-prod_postgres:5432/{{ devt_database_name }}

PAYLOAD_SECRET=CHANGE_ME
NEXT_PUBLIC_SERVER_URL=https://dev.huettenbau-oberi.ch

CRON_SECRET=CHANGE_ME
PREVIEW_SECRET=CHANGE_ME
```

`prod.env.vault`

```ini
DATABASE_URL=postgres://{{ pg_prod_user }}:{{ pg_prod_password }}@huettenbau-oberi-prod_postgres:5432/{{ prod_database_name }}

PAYLOAD_SECRET=CHANGE_ME
NEXT_PUBLIC_SERVER_URL=https://huettenbau-oberi.ch

CRON_SECRET=CHANGE_ME
PREVIEW_SECRET=CHANGE_ME
```

`postgres_users.vault`

```ini
pg_admin_user: admin
pg_admin_password: CHANGE_ME
pg_devt_user: devt_user
pg_devt_password: CHANGE_ME
pg_prod_user: prod_user
pg_prod_password: CHANGE_ME
```

Encrypt these files with ansible vault to keep the secrets safe:

```bash
ansible-vault encrypt files/cloudflare.vault
ansible-vault encrypt files/devt.env.vault
ansible-vault encrypt files/prod.env.vault
ansible-vault encrypt files/postgres_users.vault
```

## Playbooks

### `setup.yml` — Initial VPS provisioning

Run once on a fresh server. Sets up:

- System packages (`curl`, `ca-certificates`, `gnupg`, `ufw`)
- **Fail2Ban** with a configured jail
- **Docker CE** and the Compose plugin
- A shared `proxy` Docker network for Traefik
- **Traefik v3** as a reverse proxy with automatic Let's Encrypt TLS
- The application deployment directory

```bash
ansible-playbook -i inventory.ini setup.yml
```

### `deploy_postgres.yml` — Postgres deployment

Deploys the postgresql instance as a docker container. Run this before `deploy.yml` to ensure the database is available.

```bash
ansible-playbook -i inventory.ini deploy_postgres.yml
```

Needs to have prod.yml vars used.

### `deploy.yml` — Application deployment

Deploys the app with minimal downtime: pulls the new image while the old container is still serving traffic, then restarts only changed containers.

The image must already be published to GHCR before running this playbook (CI handles this on push to `main`).

```bash
# Deploy the latest image
ansible-playbook -i inventory.ini deploy.yml -e @group_vars/prod.yml

# Deploy a specific image tag
ansible-playbook -i inventory.ini deploy.yml -e @group_vars/prod.yml -e "app_image_tag=sha-abc1234"
```

## Environments

Group variables are defined per environment in `group_vars/`:

| File                   | Domain                    | Deploy path                  |
|------------------------|---------------------------|------------------------------|
| `group_vars/prod.yml`  | `huettenbau-oberi.ch`     | `/opt/huettenbau-oberi/prod` |
| `group_vars/devt.yml`  | `dev.huettenbau-oberi.ch` | `/opt/huettenbau-oberi/devt` |

To target a specific environment, use a matching inventory group or pass vars with `-e`.

## File Overview

```text
ansible/
├── deploy.yml              # Application deployment playbook
├── setup.yml               # Initial server provisioning playbook
├── requirements.yml        # Ansible Galaxy dependencies
├── inventory.ini           # Your inventory (not in git)
├── inventory.ini.example   # Inventory template
├── group_vars/
│   ├── prod.yml            # Production variables
│   └── devt.yml            # Development/staging variables
├── files/
│   ├── env.production      # Live secrets (not in git)
│   ├── env.prod.example    # Template for production .env
│   ├── env.devt.example    # Template for staging .env
│   └── env.postgres.example
└── templates/
    ├── app/                # docker-compose template for the application
    ├── database/           # Database-related templates
    ├── fail2ban/           # Fail2Ban jail configuration
    └── traefik/            # Traefik static config and docker-compose
```
