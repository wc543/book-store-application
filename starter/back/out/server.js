import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let app = express();
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
// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
