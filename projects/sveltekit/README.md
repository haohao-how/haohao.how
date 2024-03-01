# sveltekit

## Setup

1. Install [Postgres.app](https://postgresapp.com)
2. Create default server in Postgres.app

## Schema changes

1. Update `src/schema.ts`.
2. Run `moon run generate`.
3. Review the new migration in `drizzle/`.
4. Run `moon run migrate`.
