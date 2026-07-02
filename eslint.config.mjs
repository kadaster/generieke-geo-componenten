import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";

export default defineConfig([
  globalIgnores(["projects/**/node_modules/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],

    plugins: {
      "@angular-eslint": angular,
      "@angular-eslint/template": angularTemplate
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
        {
          prefix: "ggc",
          style: "kebab-case",
          type: "element"
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "ggc",
          style: "camelCase",
          type: "attribute"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/ban-ts-comment": "warn"
    }
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": angularTemplate
    },
    languageOptions: {
      parser: angularTemplateParser
    },
    rules: {
      "@angular-eslint/template/alt-text": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/mouse-events-have-key-events": "warn",
      "@angular-eslint/template/no-autofocus": "warn",
      "@angular-eslint/template/valid-aria": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn"
    }
  }
]);
