module.exports = {
  apps: [
    {
      name: 'api.geeken.com', // Production PM2 service name
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5002
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/prod-err.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      source_map_support: false,
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'staging-api.geeken.com', // Staging PM2 service name
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 6002
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/stage-err.log',
      out_file: './logs/stage-out.log',
      log_file: './logs/stage-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      source_map_support: false,
      node_args: '--max-old-space-size=1024'
    }
  ],

  // deploy: {
  //   production: {
  //     user: 'deploy',
  //     host: 'api.geeken.com',
  //     ref: 'origin/main',
  //     repo: 'git@github.com:amitshakya1/api.geeken.com.git',
  //     path: '/var/www/api.geeken.com',
  //     'post-deploy': 'npm install && npm run build && npm run migration:run && pm2 reload ecosystem.config.js --only api.geeken.com --env production',
  //   },
  //   staging: {
  //     user: 'deploy',
  //     host: 'staging-api.geeken.com',
  //     ref: 'origin/develop',
  //     repo: 'git@github.com:amitshakya1/api.geeken.com.git',
  //     path: '/var/www/staging-api.geeken.com',
  //     'post-deploy': 'npm install && npm run build && npm run migration:run && pm2 reload ecosystem.config.js --only staging-api.geeken.com --env staging',
  //   }
  // }
};
