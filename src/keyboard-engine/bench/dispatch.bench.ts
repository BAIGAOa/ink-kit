import { bench, describe } from "vitest";
import type { KeyboardLayer } from "../src/types/keyboard-layer.js";
import { MISS_KEY, layerState, newEngine, noop } from "./_setup.js";

const SCREEN = {};

/**
 * Seed engines that differ only in the amount of work a single keystroke has
 * to walk through, then time the steady-state `processKey` on a key that
 * never matches. Every structure is built outside the timed region.
 */

function globalKeysEngine(count: number) {
  const engine = newEngine();
  engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
  const entries = Array.from({ length: count }, (_, i) => ({
    key: `k${i}`,
    operate: noop,
  }));
  engine.globalKeys(entries);
  return engine;
}

function pageBindingsEngine(count: number) {
  const engine = newEngine();
  engine.sync({ pagePath: [SCREEN], layers: [], modalLayers: [] });
  for (let i = 0; i < count; i++) engine.boundKeyboard([`b${i}`], noop);
  return { engine, lastKey: count > 0 ? `b${count - 1}` : MISS_KEY };
}

function stackedScreensEngine(count: number) {
  const engine = newEngine();
  const pages = Array.from({ length: count }, () => ({}));
  for (let i = 0; i < count; i++) {
    engine.sync({ pagePath: pages.slice(0, i + 1), layers: [], modalLayers: [] });
    engine.boundKeyboard([`s${i}`], noop);
  }
  engine.sync({ pagePath: pages, layers: [], modalLayers: [] });
  return engine;
}

function openLayersEngine(count: number) {
  const engine = newEngine();
  const allLayers: KeyboardLayer[] = [];
  for (let i = 0; i < count; i++) {
    const layerId = `L${i}`;
    const elementId = `el${i}`;
    const layer = layerState(layerId, [elementId]);
    engine.sync({ pagePath: [], layers: [layer], modalLayers: [] });
    engine.pushOwner(layerId);
    engine.boundKeyboard([`x${i}`], noop, { elementId });
    engine.popOwner(layerId);
    allLayers.push(layer);
  }
  engine.sync({ pagePath: [], layers: allLayers, modalLayers: [] });
  return engine;
}

function modalEngine() {
  const engine = newEngine();
  engine.sync({
    pagePath: [SCREEN],
    layers: [],
    modalLayers: [layerState("M", ["modal-el"])],
  });
  engine.pushOwner("M");
  engine.boundKeyboard(["return"], noop, { elementId: "modal-el" });
  engine.popOwner("M");
  return engine;
}

describe("dispatch hot path", () => {
  describe("global-key miss (scans every entry in overlay + screen phases)", () => {
    for (const n of [0, 10, 100, 1000]) {
      const engine = globalKeysEngine(n);
      bench(`N=${n}`, () => {
        engine.processKey(MISS_KEY, {});
      });
    }
  });

  describe("global-key hit position", () => {
    for (const n of [1, 10, 100, 1000]) {
      const first = globalKeysEngine(n);
      const last = globalKeysEngine(n);
      bench(`hit first of ${n}`, () => {
        first.processKey("k0", {});
      });
      bench(`hit last of ${n}`, () => {
        last.processKey(`k${n - 1}`, {});
      });
    }
  });

  describe("screen binding scan (hit at end of the page's binding array)", () => {
    for (const n of [1, 10, 100, 1000]) {
      const { engine, lastKey } = pageBindingsEngine(n);
      bench(`bindings=${n}`, () => {
        engine.processKey(lastKey, {});
      });
    }
  });

  describe("screen-stack walk with stacked bound pages (full miss)", () => {
    for (const n of [1, 5, 20, 50]) {
      const engine = stackedScreensEngine(n);
      bench(`pages=${n}`, () => {
        engine.processKey(MISS_KEY, {});
      });
    }
  });

  describe("layer broadcast over open layers (full miss)", () => {
    for (const n of [1, 5, 20, 50]) {
      const engine = openLayersEngine(n);
      bench(`layers=${n}`, () => {
        engine.processKey(MISS_KEY, {});
      });
    }
  });

  describe("modal barrier consumes an unbound key", () => {
    const engine = modalEngine();
    bench("modal open, key falls to barrier", () => {
      engine.processKey(MISS_KEY, {});
    });
  });
});
