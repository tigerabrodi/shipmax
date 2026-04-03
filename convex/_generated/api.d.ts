/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as leaderboard_queries from "../leaderboard/queries.js";
import type * as shared_errors from "../shared/errors.js";
import type * as users_actions from "../users/actions.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_og_actions from "../users/og_actions.js";
import type * as users_queries from "../users/queries.js";
import type * as users_shared from "../users/shared.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "leaderboard/queries": typeof leaderboard_queries;
  "shared/errors": typeof shared_errors;
  "users/actions": typeof users_actions;
  "users/mutations": typeof users_mutations;
  "users/og_actions": typeof users_og_actions;
  "users/queries": typeof users_queries;
  "users/shared": typeof users_shared;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
