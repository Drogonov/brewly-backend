import { TransformFnParams, Transform } from 'class-transformer';

/**
 * A universal transformer that converts various input types to a boolean.
 *
 * It handles:
 * - Booleans: returns as is.
 * - Numbers: returns true for 1, false for 0.
 * - Strings:
 *    - "true" and "1" become true.
 *    - "false" and "0" become false.
 *    - Otherwise falls back to Boolean conversion.
 */
export function BooleanTransformer() {
  return Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
      // If the string is non-empty and not any of the above, default to JavaScript conversion.
      return Boolean(normalized);
    }
    return Boolean(value);
  });
}