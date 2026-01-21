import reactConfig from "@repo/eslint-config/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    ignores: [".next/**", "out/**", "next-env.d.ts"],
  },
];
