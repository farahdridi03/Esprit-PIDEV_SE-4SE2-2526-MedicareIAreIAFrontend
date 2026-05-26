/**
 * Polyfills for tests to fix 'ReferenceError: global is not defined' 
 * caused by libraries like sockjs-client.
 */
(window as any).global = window;
