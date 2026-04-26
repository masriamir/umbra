/**
 * @fileoverview Global test setup: jest-dom matchers and MSW server lifecycle.
 */

import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
