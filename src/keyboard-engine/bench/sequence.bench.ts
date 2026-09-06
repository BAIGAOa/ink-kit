import { bench, describe } from "vitest";
import { MISS_KEY, newEngine, noop } from "./_setup.js";

const SCREEN = {};

function pageEngine() {
  const engine = newEngine();
  engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
  return engine;
}

describe("sequence engine", () => {
  describe("page boundSequence: start + complete while N candidates share the first key", () => {
    for (const n of [1, 10, 100, 1000]) {
      const engine = pageEngine();
      for (let i = 0; i < n; i++) engine.boundSequence(["a", `s${i}`], noop);
      bench(`first-key candidates=${n}`, () => {
        engine.processKey("a", {});
        engine.processKey("s0", {});
      });
    }
  });

  describe("globalSequence miss (scans every entry in overlay + screen phases)", () => {
    for (const n of [0, 10, 100, 1000]) {
      const engine = pageEngine();
      engine.globalSequence(
        Array.from({ length: n }, (_, i) => ({
          keys: [`f${i}`, `s${i}`],
          operate: noop,
        })),
      );
      bench(`entries=${n}`, () => {
        engine.processKey(MISS_KEY, {});
      });
    }
  });

  describe("globalSequence pending + exclusive mismatch (restarted each iteration, net-zero)", () => {
    for (const n of [1, 10, 100, 1000]) {
      const engine = pageEngine();
      engine.globalSequence(
        Array.from({ length: n }, (_, i) => ({
          keys: ["a", `s${i}`],
          operate: noop,
          exclusive: i === 0,
        })),
      );
      bench(`entries=${n}`, () => {
        engine.processKey("a", {}); // start: exclusive selected entry
        engine.processKey(MISS_KEY, {}); // mismatch: silently consumed
        engine.processKey("s0", {}); // complete and clear pending
      });
    }
  });
});
