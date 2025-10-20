module.exports = {
  apps: [
    {
      name: 'adlaan-backend-dev',
      script: 'npm',
      args: 'run start:dev',
      cwd: '/home/husain/Desktop/adlaan/adlaan-backend',
      watch: false,  // Nest.js has its own file watching in dev mode
      env: {
        NODE_ENV: 'development',
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
};