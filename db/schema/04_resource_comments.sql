DROP TABLE IF EXISTS resource_comments CASCADE;
CREATE TABLE resource_comments (
  id SERIAL PRIMARY KEY NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);