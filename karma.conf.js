module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
          { pattern: "src/**/*.ts" }, // *.tsx for React Jsx
        ],
        preprocessors: {
          "src/**/*.ts": ["karma-typescript"], // *.tsx for React Jsx
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"],
        singleRun: true
    });
};
