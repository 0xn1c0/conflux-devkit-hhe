import globals from "globals";

import pluginJs from "@eslint/js";

export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    ignores: ["dist/*"],
  },
  pluginJs.configs.recommended,
];
