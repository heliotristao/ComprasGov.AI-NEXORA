declare module "use-sync-external-store" {
  export function useSyncExternalStore<Snapshot>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot?: () => Snapshot
  ): Snapshot
}
