// Configuración de PM2 para el portafolio (www.kayrelabs.com -> localhost:8181)
module.exports = {
  apps: [
    {
      name: "kayrelabs",
      script: "server.js",
      cwd: __dirname,
      env: { PORT: 8181 },
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,
    },
  ],
};
