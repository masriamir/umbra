/**
 * @fileoverview MSW Node server instance shared across all tests.
 */

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
