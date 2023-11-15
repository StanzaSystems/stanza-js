// src/mocks/server.js
import 'isomorphic-fetch';
import { setupServer } from 'msw/node';
import { handlers } from '@getstanza/mocks-handlers';
// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers);
