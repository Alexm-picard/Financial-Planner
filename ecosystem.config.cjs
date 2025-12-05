module.exports = {
  apps: [
    {
      name: 'financial-planner-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        HOST: '0.0.0.0'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
        HOST: '0.0.0.0'
      },
      // Logging (relative to cwd which is ./backend)
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Auto restart on crashes
      autorestart: true,
      // Don't watch files in production (saves resources)
      watch: false,
      // Restart if memory exceeds 1GB
      max_memory_restart: '1G',
      // Graceful shutdown settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Merge logs from all instances
      merge_logs: true,
      // Restart delay (ms) after crash
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};

