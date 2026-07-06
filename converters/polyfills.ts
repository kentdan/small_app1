// Minimal polyfills so pdfjs-dist can load under Hermes (React Native's engine),
// which lacks several browser globals pdfjs references. Importing this module
// for its side effects is enough; it is idempotent.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

// structuredClone — used by pdfjs message handling
if (typeof g.structuredClone !== 'function') {
  g.structuredClone = (obj: unknown) =>
    obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

// Promise.withResolvers — newer pdfjs builds expect this
const P = Promise as unknown as { withResolvers?: unknown };
if (typeof P.withResolvers !== 'function') {
  P.withResolvers = function withResolvers<T>() {
    let resolve!: (v: T | PromiseLike<T>) => void;
    let reject!: (r?: unknown) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}

// DOMMatrix — referenced by pdfjs' display layer. We only extract text, so a
// no-op stub is enough to let the module load without ReferenceErrors.
if (typeof g.DOMMatrix !== 'function') {
  class DOMMatrixStub {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(_init?: unknown) {}
    multiplySelf() { return this; }
    translateSelf() { return this; }
    scaleSelf() { return this; }
  }
  g.DOMMatrix = DOMMatrixStub;
}
