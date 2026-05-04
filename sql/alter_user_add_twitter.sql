ALTER TABLE users
  ADD COLUMN twitter_id          VARCHAR(50)  NULL AFTER summary_prompt,
  ADD COLUMN twitter_username    VARCHAR(100) NULL AFTER twitter_id,
  ADD COLUMN twitter_access_token  TEXT       NULL AFTER twitter_username,
  ADD COLUMN twitter_refresh_token TEXT       NULL AFTER twitter_access_token;
