import 'server-only'

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { env } from '@/env'

import * as schema from './schema'

type Database = ReturnType<typeof createDatabase>

/**
 * Creates the database client. The Neon HTTP driver makes a stateless
 * HTTPS request per query — no persistent socket or connection pool —
 * so a Worker isolate freezing between requests (e.g. during the GitHub
 * OAuth round-trip) can't leave a dead connection behind for the next
 * request to hang on.
 * @returns {Database} The database client.
 */
function createDatabase() {
  const sql = neon(env.DATABASE_URL)
  return drizzle(sql, { schema })
}

let database: Database | undefined

/**
 * Returns the shared client, creating it on first use.
 * @returns {Database} The shared database client.
 */
function getDatabase(): Database {
  database ??= createDatabase()
  return database
}

// The proxy target is a real client so `instanceof`-style checks (e.g. the
// Auth.js Drizzle adapter) recognise `db` as a Postgres database; all actual
// queries forward to the lazily resolved client.
export const db = new Proxy(createDatabase(), {
  get(_target, property) {
    const client = getDatabase()
    const value: unknown = Reflect.get(client, property, client)
    if (typeof value === 'function') {
      const fn = value as (...args: unknown[]) => unknown
      return (...args: unknown[]) => fn.apply(client, args)
    }
    return value
  }
})
