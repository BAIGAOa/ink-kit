import type KeyboardEngine from "../src/KeyboardEngine.js";
import type { KeyboardLayer } from "../src/types/keyboard-layer.js";
import { createEngine } from "../tests/_helpers/factories.js";

/** No-op handler so benchmarks measure dispatch, not side effects. */
export const noop = (): void => {};

/** Key never registered by any scenario, so it always misses the first stages. */
export const MISS_KEY = "z";

export { createEngine };

export function newEngine(): KeyboardEngine {
  return createEngine();
}

/** Build a KeyboardLayer descriptor for `sync()` from a layer id and its active elements. */
export function layerState(
  layerId: string,
  elements: string[],
): KeyboardLayer {
  return { layerId, elements, activeElements: elements };
}
