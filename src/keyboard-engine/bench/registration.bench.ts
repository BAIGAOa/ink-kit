import { bench, describe } from "vitest";
import { newEngine, noop } from "./_setup.js";

const SCREEN = {};

function pageEngine() {
  const engine = newEngine();
  engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
  return engine;
}

describe("registration / deregistration", () => {
  describe("engine.sync reassignment (host re-render) at growing pagePath", () => {
    for (const n of [1, 10, 100, 1000]) {
      const engine = newEngine();
      const state = {
        pagePath: Array.from({ length: n }, () => ({})),
        layers: [],
        modalLayers: [],
      };
      bench(`pages=${n}`, () => {
        engine.sync(state);
      });
    }
  });

  describe("boundKeyboard + unbind against a page with N existing bindings", () => {
    for (const n of [0, 10, 100, 1000]) {
      const engine = pageEngine();
      for (let i = 0; i < n; i++) engine.boundKeyboard([`e${i}`], noop);
      bench(`existing=${n}`, () => {
        const unbind = engine.boundKeyboard(["q"], noop);
        unbind();
      });
    }
  });

  describe("boundKeyboard + unbind under N registered globalKeys", () => {
    for (const n of [0, 10, 100, 1000]) {
      const engine = pageEngine();
      engine.globalKeys(
        Array.from({ length: n }, (_, i) => ({ key: `g${i}`, operate: noop })),
      );
      bench(`globalKeys=${n}`, () => {
        const unbind = engine.boundKeyboard(["q"], noop);
        unbind();
      });
    }
  });
});
