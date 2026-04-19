#!/bin/bash

pnpm install

source .env.local

docker compose -f docker-compose.local.yml up -d

pnpm run dev
