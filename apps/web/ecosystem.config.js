module.exports = {
  apps: [
    {
      name: 'web',
      script: '.next/standalone/web/server.js',
      env: {
        PORT: process.env.PORT || 3000,
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
}
