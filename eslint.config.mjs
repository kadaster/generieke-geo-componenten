import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "dist/**", "coverage/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],

    plugins: {
      "@angular-eslint": angular,
      prettier
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { prefix: "ggc", style: "kebab-case", type: "element" }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { prefix: "ggc", style: "camelCase", type: "attribute" }
      ],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          classes: {
            memberTypes: [
              "public-field",
              "protected-field",
              "private-field",
              ["decorated-set", "decorated-get", "set", "get"]
            ]
          }
        }
      ],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prettier/prettier": "error"
    }
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": angularTemplate,
      prettier
    },
    languageOptions: {
      parser: angularTemplateParser
    },
    rules: {
      "@angular-eslint/template/alt-text": "warn",
      "@angular-eslint/template/elements-content": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/no-positive-tabindex": "warn",
      "@angular-eslint/template/valid-aria": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/mouse-events-have-key-events": "warn",
      "@angular-eslint/template/no-autofocus": "warn",
      "@angular-eslint/template/no-distracting-elements": "warn",
      "@angular-eslint/template/role-has-required-aria": "warn"
    }
  }
]);
