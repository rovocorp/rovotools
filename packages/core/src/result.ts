export type Result<T, E> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): { readonly ok: true; readonly value: T } {
  return { ok: true, value };
}

export function fail<E>(error: E): { readonly ok: false; readonly error: E } {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { readonly ok: true; readonly value: T } {
  return result.ok === true;
}

export function isFail<T, E>(result: Result<T, E>): result is { readonly ok: false; readonly error: E } {
  return result.ok === false;
}

export function mapOk<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}

export function mapFail<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (result.ok) {
    return result;
  }
  return { ok: false, error: fn(result.error) };
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

export function unwrapOrThrow<T, E>(result: Result<T, E>, errorFactory: (error: E) => Error): T {
  if (result.ok) {
    return result.value;
  }
  throw errorFactory(result.error);
}
