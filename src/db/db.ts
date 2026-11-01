import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/node-postgres'

import { env } from '@/env'

import * as schema from './schema'

type Database = ReturnType<typeof createDatabase>

/**
 * Creates the database client. On Workers it connects through the Hyperdrive
 * binding; anywhere else (local dev, build) it uses DATABASE_URL.
 * @returns {Database} The database client.
 */
function createDatabase() {
  try {
    const { env: cloudflareEnv } = getCloudflareContext()
    const hyperdrive = (cloudflareEnv as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE
    if (hyperdrive?.connectionString) {
      return drizzle({ connection: hyperdrive.connectionString, schema })
    }
  } catch {
    // Not running on Workers (local dev or build) — fall through to DATABASE_URL.
  }
  return drizzle({ connection: env.DATABASE_URL, schema })
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
// queries forward to the lazily resolved client, whose connection comes from
// the Hyperdrive binding when running on Workers.
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
