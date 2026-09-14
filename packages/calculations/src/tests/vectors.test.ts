import { describe, expect, it } from "vitest";

import {
  CALCULATION_VECTORS,
  INVALID_VECTORS,
  compareResult,
  errorNameOf,
  runVector,
} from "../vectors";

describe("shared calculation vectors", () => {
  it.each(CALCULATION_VECTORS.map((vector) => [vector.label, vector] as const))(
    "%s",
    (_label, vector) => {
      expect(compareResult(runVector(vector.engine, vector.input), vector.expected, vector.tolerance)).toEqual([]);
    },
  );

  it.each(INVALID_VECTORS.map((vector) => [vector.label, vector] as const))(
    "rejects %s",
    (_label, vector) => {
      let thrown: unknown = null;
      try {
        runVector(vector.engine, vector.input);
      } catch (error) {
        thrown = error;
      }
      expect(errorNameOf(thrown)).toBe(vector.errorName);
    },
  );
});
