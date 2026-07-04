/**
 * PM2 process file for Hostinger VPS deployment.
 * Run from the repo root after `pnpm install && pnpm build`:
 *
 *   pm2 start ecosystem.config.js
 *   pm2 save && pm2 startup   # survive server reboots
 */
module.exports = {
  apps: [
    {
      name: 'minara-api',
      cwd: './apps/api',
      script: 'dist/server.js',
      env: { NODE_ENV: 'production', PORT: 5000 },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      kill_timeout: 12000, // let graceful shutdown finish in-flight orders
    },
    {
      name: 'minara-store',
      cwd: './apps/store',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3000',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'minara-admin',
      cwd: './apps/admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3001',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
};
