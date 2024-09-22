module.exports = {
  apps: [
    {
      name: "nuxt",
      cwd: "./nuxt",
      script: "npm",
      args: "run dev",
    },
    {
      name: "strapi",
      cwd: "./strapi",
      script: "npm",
      args: "run develop",
      env: {
        "NODE_ENV": "production",
      }
    },
  ],
};
