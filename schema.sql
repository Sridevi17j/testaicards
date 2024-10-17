CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan_name TEXT,
  cards_remaining INTEGER,
  date_created TEXT
);