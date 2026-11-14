import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginImport from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      // Enforce consistent import order
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "pathGroups": [
            {
              "pattern": "@/**",
              "group": "internal"
            }
          ],
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          }
        }
      ],
      // TypeScript already verifies namespace members, and this rule can't
      // resolve @sentry/nextjs's client-only exports (false positive).
      "import/namespace": "off",
      // React Compiler advisories (existing setState-in-effect / declaration
      // order patterns in client components). Kept visible as warnings until
      // those components are refactored and checked in the browser.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
