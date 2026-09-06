import { bench, describe } from "vitest";
import { newEngine } from "./_setup.js";

const SCREEN = {};

function chainEngine() {
  const engine = newEngine();
  engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
  engine.registryCompositionKey({
    key: "3",
    flags: [],
    alternativeFlag: "times",
    needs: [],
    execute: (ctx) => ({
      value: 3,
      lastFlag: "times",
      steps: [...ctx.steps, "3"],
    }),
  });
  engine.registryCompositionKey({
    key: "w",
    flags: [],
    alternativeFlag: "action",
    needs: ["times"],
    optional: true,
    execute: (ctx) => ({
      value: ctx.value,
      lastFlag: "action",
      steps: [...ctx.steps, "w"],
    }),
  });
  return engine;
}

describe("composition engine", () => {
  describe("two-key chain advance (start + mid-chain key, aborted to stay net-zero)", () => {
    const engine = chainEngine();
    bench("chain 3 -> w", () => {
      engine.processKey("3", {});
      engine.processKey("w", {});
      engine.abortComposition();
    });
  });

  describe("head-key miss while N entries share the same key but need an earlier flag", () => {
    for (const n of [1, 100, 1000]) {
      const engine = newEngine();
      engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
      for (let i = 0; i < n; i++) {
        engine.registryCompositionKey({
          key: "a",
          flags: [],
          alternativeFlag: `alt${i}`,
          needs: [`zzz${i}`],
        });
      }
      bench(`shared-key entries=${n}`, () => {
        engine.processKey("a", {});
      });
    }
  });
});
