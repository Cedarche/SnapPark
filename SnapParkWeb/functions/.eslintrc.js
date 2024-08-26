module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: "off",
    "import/no-unresolved": "off",
    indent: "off",
    "object-curly-spacing": "off", // Turn off object-curly-spacing rule
    "max-len": "off", // Increase max line length to 120 or turn it off
    "@typescript-eslint/no-unused-vars": "off", // Ignore unused vars that start with _
    semi: "off",
    "padded-blocks": "off",
    "comma-dangle": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
  },
};
