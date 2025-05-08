declare global {
  interface Window {
    __pendingFetches: Map<number, Promise<any>>;
  }
}

export {};

