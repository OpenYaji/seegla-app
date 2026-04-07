export type ReadResult<T> = {
  data: T;
  nextCursor?: string | null;
};

export type WriteResult<T, E extends string = string> = {
  data: T | null;
  error: E | null;
};

