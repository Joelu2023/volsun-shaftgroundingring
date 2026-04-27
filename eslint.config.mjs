import tsParser from "@typescript-eslint/parser";

/** 最小 ESLint Flat Config
 * 目标：让 `npm run lint` 在当前仓库中非交互式执行（不做无关规则增强）。
 * 只做语法层/解析层检查；不启用大量规则以避免引入新的维护成本。
 */
export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "docs/**"],
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
];

