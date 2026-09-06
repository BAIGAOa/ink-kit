import { bench, describe } from "vitest";
import { newEngine, noop } from "./_setup.js";

const SCREEN = {};

describe("focus system", () => {
  describe("focusNext cycles one default-group focus target at a time (O(N) rotation)", () => {
    for (const n of [1, 10, 100, 1000]) {
      const engine = newEngine();
      engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
      for (let i = 0; i < n; i++) {
        engine.boundKeyboard([`k${i}`], noop, { focusId: `f${i}` });
      }
      bench(`targets=${n}`, () => {
        engine.focusNext();
      });
    }
  });
});
