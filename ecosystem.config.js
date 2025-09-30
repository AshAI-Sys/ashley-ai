/**
 * PM2 Ecosystem Configuration for Ashley AI
 * Production process management configuration
 *
 * Usage:
 *   Start: pm2 start ecosystem.config.js
 *   Stop: pm2 stop ecosystem.config.js
 *   Restart: pm2 restart ecosystem.config.js
 *   Logs: pm2 logs
 *   Monitor: pm2 monit
 */

module.exports = {
  apps: [
    // Ashley AI Admin Service
    {
      name: 'ashley-admin',
      script: 'pnpm',
      args: '--filter @ash/admin start',
      cwd: '/var/www/ashley-ai',
      instances: 2, // Number of instances (cluster mode)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/ashley-admin-error.log',
      out_file: '/var/log/pm2/ashley-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    // Ashley AI Client Portal
    {
      name: 'ashley-portal',
      script: 'pnpm',
      args: '--filter @ash/portal start',
      cwd: '/var/www/ashley-ai',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      error_file: '/var/log/pm2/ashley-portal-error.log',
      out_file: '/var/log/pm2/ashley-portal-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    // Background Worker (if needed)
    // {
    //   name: 'ashley-worker',
    //   script: 'dist/worker/index.js',
    //   cwd: '/var/www/ashley-ai',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   watch: false,
    //   max_memory_restart: '512M',
    //   env: {
    //     NODE_ENV: 'production',
    //   },
    //   error_file: '/var/log/pm2/ashley-worker-error.log',
    //   out_file: '/var/log/pm2/ashley-worker-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   autorestart: true,
    // },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/ashley-ai.git',
      path: '/var/www/ashley-ai',
      'post-deploy':
        'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};