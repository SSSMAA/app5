export default {
  apps: [{
    name: 'ischoolgo-app',
    script: 'npx',
    args: 'serve -s dist -p 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
