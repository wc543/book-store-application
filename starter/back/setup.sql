CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER,
    title TEXT,
    pub_year TEXT,
    genre TEXT,
    FOREIGN KEY(author_id) REFERENCES authors(id)
);

CREATE TABLE authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    bio TEXT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
);