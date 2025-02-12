import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import * as argon2 from "argon2";
import cookieParser from "cookie-parser";
import crypto from "crypto";
let app = express();
app.use(cookieParser());
app.use(express.json());
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
argon2.hash("password").then(h => { console.log(h); });
let tokenStorage = {};
// in a "real app", this would be a database ^
let cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
};
function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}
app.post("/api/authors", async (req, res) => {
    const { name, bio } = req.body;
    if (!name || !bio) {
        return res.status(400).json({ error: "Please enter a name and bio for the author" });
    }
    try {
        const result = await db.run("INSERT INTO authors (name, bio) VALUES (?, ?)", [name, bio]);
        const authorId = result.lastID;
        const author = await db.get("SELECT * FROM authors WHERE id = ?", [authorId]);
        return res.json(author);
    }
    catch (error) {
        console.error("Error creating author: ", error);
        return res.status(500).json({ error: "Failed to create author" });
    }
});
app.get("/api/authors", async (req, res) => {
    try {
        const authors = await db.all("SELECT * FROM authors");
        return res.json(authors);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch authors" });
    }
});
app.get("/api/authors/:id", async (req, res) => {
    const authorId = req.params.id;
    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?", [authorId]);
        if (!author) {
            return res.status(404).json({ error: "Cannot find author with that id" });
        }
        return res.json(author);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch author" });
    }
});
app.delete("/api/authors/:id", async (req, res) => {
    const authorId = req.params.id;
    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?", [authorId]);
        if (!author) {
            return res.status(404).json({ error: "Cannot find author with that id" });
        }
        const books = await db.all("SELECT * FROM books WHERE author_id = ?", [authorId]);
        if (books.length > 0) {
            return res.status(400).json({ error: "Cannot delete author with books associated with them" });
        }
        const result = await db.run("DELETE FROM authors WHERE id = ?", [authorId]);
        return res.json({ success: "Author deleted" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete author" });
    }
});
app.post("/api/books", async (req, res) => {
    const { author_id, title, pub_year, genre } = req.body;
    if (!author_id || !title || !pub_year || !genre) {
        return res.status(400).json({ error: "Please enter a author id, title, publication year and genre for the book" });
    }
    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?", [author_id]);
        if (!author) {
            return res.status(400).json({ error: "Author id does not exist" });
        }
        const result = await db.run("INSERT INTO books (author_id, title, pub_year, genre) VALUES (?, ?, ?, ?)", [author_id, title, pub_year, genre]);
        const bookId = result.lastID;
        const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
        return res.json(book);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create a book" });
    }
});
app.get("/api/books", async (req, res) => {
    try {
        const books = await db.all("SELECT * FROM books");
        return res.json(books);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch books" });
    }
});
app.get("/api/books/:year", async (req, res) => {
    const bookYear = req.params.year;
    try {
        const books = await db.all("SELECT * FROM books WHERE pub_year >= ?", [bookYear]);
        if (books.length === 0) {
            return res.status(404).json({ error: "No books found for that publication year or later" });
        }
        return res.json(books);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch books" });
    }
});
app.get("/api/books/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
        if (!book) {
            return res.status(404).json({ error: "Cannot find book with that id" });
        }
        return res.json(book);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch book" });
    }
});
app.delete("/api/books/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
        if (!book) {
            return res.status(404).json({ error: "Cannot find book with that id" });
        }
        const result = await db.run("DELETE FROM books WHERE id = ?", [bookId]);
        return res.json({ success: "Book deleted" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete book" });
    }
});
app.put("/api/books/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);
    const { author_id, title, pub_year, genre } = req.body;
    if (!author_id || !title || !pub_year || !genre) {
        return res.status(400).json({ error: "Please enter a author id, title, publication year and genre for the book" });
    }
    try {
        const result = await db.run("UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?", [author_id, title, pub_year, genre, bookId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        const newBook = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
        return res.json(newBook);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to update book information" });
    }
});
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Please enter username and password" });
    }
    else if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    try {
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }
        const hashedPassword = await argon2.hash(password);
        const result = await db.run("INSERT INTO users(username, password) VALUES(?, ?)", [username, hashedPassword]);
        const userId = result.lastID;
        const newUser = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
        return res.json(newUser);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to register" });
    }
});
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Please enter username and password" });
    }
    const result = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!result) {
        return res.status(400).json({ error: "Username does not exist" });
    }
    try {
        if (await argon2.verify(result.password, password)) {
            const token = makeToken();
            tokenStorage[username] = token;
            return res.cookie("token", token, cookieOptions).json({ success: "Logged in", token });
        }
        else {
            return res.status(400).json({ error: "Password is incorrect" });
        }
    }
    catch (err) {
        return res.status(500).json({ error: "Internal Server error" });
    }
});
// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
