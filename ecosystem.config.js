module.exports = {
    apps: [
        {
            name: 'adlaan-frontend',
            cwd: '/home/husain/adlaan/adlaan',
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'adlaan-backend',
            cwd: '/home/husain/adlaan/adlaan-backend',
            script: 'npm',
            args: 'run start:prod',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 4001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4001
            }
        }
    ]
};
