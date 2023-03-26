module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
   // pm2 start ecosystem.config.js 
  apps: [
    {
      name: "PROJECT-SYUKRAN_COURIER_SERVICE x8902",
      script: "index.js"
      // interpreter: "/usr/local/lib/nodejs/node-v12.14.1/bin/node"
    }
  ],
};
