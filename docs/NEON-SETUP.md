# Neon PostgreSQL and Neon Auth

Updated 14 October 2026. Neon is the founder-selected database and authentication provider. The earlier managed database/auth proposal is superseded. No Neon project, database schema, production account, or Auth instance has been provisioned by this commit.

## What is implemented

- Next.js public landing page, which builds and runs without private backend settings.
- Server-only, lazy Neon PostgreSQL driver in `apps/web/src/lib/db/neon.ts`.
- Server-only Neon Auth setup in `apps/web/src/lib/auth/server.ts`.
- Auth proxy route at `/api/auth/[...path]`, returning HTTP 503 when configuration is absent.
- Public sign-up blocked through the app proxy, pending school invitation design.
- An honest `/portal` availability page. Sign-in and role dashboards are later work; no fake accounts or successful logins are provided.

The pinned Auth SDK is `@neondatabase/auth@0.6.0-beta`. Its beta status means integration must be retested before production, including session expiry, revocation, cookies, account recovery, and SDK upgrades. The SDK's server adapter is used directly; its optional pre-built UI is not imported into public pages.

## Connect a development environment

1. Install/connect the Neon plugin in Codex, or use the school-authorised Neon Console. Do not send credentials through chat.
2. Create a development project/branch. Use only synthetic data. Do not branch production student data into general developer previews.
3. Enable Neon Auth on the development branch and obtain its Auth base URL from the branch Auth configuration.
4. Create a restricted application database role. Keep owner/migration credentials separate from ordinary request credentials.
5. Copy `apps/web/.env.example` to `apps/web/.env.local` and set the following server-only values:

```text
DATABASE_URL=your-restricted-development-connection-string
NEON_AUTH_BASE_URL=your-development-auth-base-url
NEON_AUTH_COOKIE_SECRET=a-cryptographically-random-secret-of-at-least-32-characters
```

6. Generate the cookie secret with a cryptographically secure local tool. Do not check `.env.local` into Git.
7. Configure permitted origins/redirects for local development and later staging. Confirm exact browser/cookie behaviour against the current SDK documentation.
8. Implement invitation/account provisioning and database-backed school role grants before enabling sign-in. An Auth account alone grants no school role.
9. Test session validation, revocation, deactivated staff, unauthorised records, and rejected self-assigned roles before importing any real data.

## Database access model

All academic/billing database access goes through the trusted Next.js server. The browser never receives `DATABASE_URL` or sends arbitrary SQL. Validate the Neon Auth session server-side, then look up the actor's school membership/role/assignment before each operation. Map Neon Auth's user identifier to an application-owned profile; do not assume all Auth IDs are PostgreSQL UUIDs.

PostgreSQL RLS is defence in depth, not automatic Neon Auth authorisation. Use a non-owner, non-`BYPASSRLS` application role. For policies relying on identity, set a verified identity with transaction-local settings inside the same database transaction as the query. A browser-supplied user ID is never trusted. Avoid session-global identity settings with pooled connections.

The initial HTTP driver helper provides parameterised SQL, not permission enforcement. Critical multi-statement operations will use an explicit supported transaction or constrained stored function. If interactive transactions are needed, select the appropriate Neon connection mode/driver first. Owner-role connections can bypass ordinary RLS, so do not use them for routine school requests.

## File storage and backup

Relational database choice does not automatically provision private file storage. Select and configure private object storage separately when reports/submissions are implemented. Evaluate current Neon Object Storage availability or a compatible external provider before choosing it. Require private downloads, validated uploads, signed URLs, and separate object backups.

Agree Neon restore/retention settings and test database recovery. Back up object content separately and keep a snapshot/file manifest. Neon branch creation is not by itself a complete backup and disaster-recovery plan.

## Primary references

- [Neon Auth Next.js integration](https://neon.com/docs/auth/quick-start/nextjs)
- [Neon serverless PostgreSQL driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon PostgreSQL connection guide](https://neon.com/docs/connect/connect-from-any-app)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

Recheck provider configuration and SDK support before activating authentication.
