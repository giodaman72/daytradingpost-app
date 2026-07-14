module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 30000,
      url: ["http://127.0.0.1:3000/"],
    },
    assert: {
      assertions: {
        "categories:accessibility": ["warn", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:seo": ["warn", { minScore: 0.85 }],
        "errors-in-console": "error",
      },
    },
    upload: {
      outputDir: ".lighthouseci",
      target: "filesystem",
    },
  },
};
