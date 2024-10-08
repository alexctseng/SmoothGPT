declare module 'sse.js' {
  export default class SSE {
    constructor(url: string, options?: SSEOptions);
    addEventListener(event: string, callback: (e: MessageEvent) => void): void;
    removeEventListener(event: string, callback: (e: MessageEvent) => void): void;
    close(): void;
  }

  interface SSEOptions {
    headers?: Record<string, string>;
    payload?: string;
    method?: string;
    withCredentials?: boolean;
  }
}
