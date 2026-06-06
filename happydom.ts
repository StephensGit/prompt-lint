import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// React 19 expects this flag in a test environment.
// @ts-expect-error — set on globalThis for React's test utilities
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
