module.exports = {
  apps: [{
    name: 'smarthire-api',
    script: 'server.js',
    cwd: '/home/ubuntu/smarthire/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5050
    },
    max_memory_restart: '800M',
    error_file: '/home/ubuntu/smarthire/logs/error.log',
    out_file: '/home/ubuntu/smarthire/logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    restart_delay: 3000,
    max_restarts: 10,
    watch: false
  }]
};
