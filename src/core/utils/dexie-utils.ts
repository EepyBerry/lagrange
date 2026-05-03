import type { DBCoreMutateRequest } from 'dexie';

export type RequestMutatorFn<T extends DBCoreMutateRequest> = (req: T) => void;

export function mutateDBCoreRequestOn<T extends DBCoreMutateRequest>(
  req: T,
  mutate: RequestMutatorFn<T>,
  predicate: boolean,
) {
  if (!predicate) return;
  mutate(req);
}
