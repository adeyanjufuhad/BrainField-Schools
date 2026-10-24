-- The web application connects as brainfield_app (created by scripts/db-migrate.mjs with a generated
-- password). It can read school data and call the workflow functions, but cannot insert, update or
-- delete any table directly, create objects, or bypass row security.

revoke all on schema app from public;
grant usage on schema app to brainfield_app;
grant select on all tables in schema app to brainfield_app;
alter default privileges in schema app grant select on tables to brainfield_app;

revoke execute on all functions in schema app from public;
grant execute on function
  app.save_scores(uuid, uuid, integer, jsonb),
  app.submit_sheet(uuid, uuid, integer),
  app.review_sheet(uuid, uuid, integer, boolean, text),
  app.class_approve(uuid, uuid, integer),
  app.vp_decide(uuid, uuid, integer, boolean, text),
  app.publish_batch(uuid, uuid, integer)
to brainfield_app;
