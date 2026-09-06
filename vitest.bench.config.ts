import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/keyboard-engine/bench/**/*.bench.ts"],
  },
});
