import express, { Response } from "express";
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

//
// SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//

// // insert example
// await db.run(
//     "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')",
// );
// await db.run(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')",
// );

// // insert example with parameterized queries
// // important to use parameterized queries to prevent SQL injection
// // when inserting untrusted data
// let statement = await db.prepare(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)",
// );
// await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
// await statement.run();

// // select examples
// let authors = await db.all("SELECT * FROM authors");
// console.log("Authors", authors);
// let books = await db.all("SELECT * FROM books WHERE author_id = '1'");
// console.log("Books", books);
// let filteredBooks = await db.all("SELECT * FROM books WHERE pub_year = '1867'");

// console.log("Some books", filteredBooks);

// //
// // EXPRESS EXAMPLES
// //

// // GET/POST/DELETE example
// interface Foo {
//     message: string;
// }
// interface Error {
//     error: string;
// }
// type FooResponse = Response<Foo | Error>;
// // res's type limits what responses this request handler can send
// // it must send either an object with a message or an error
// app.get("/foo", (req, res: FooResponse) => {
//     if (!req.query.bar) {
//         return res.status(400).json({ error: "bar is required" });
//     }
//     return res.json({ message: `You sent: ${req.query.bar} in the query` });
// });
// app.post("/foo", (req, res: FooResponse) => {
//     if (!req.body.bar) {
//         return res.status(400).json({ error: "bar is required" });
//     }
//     return res.json({ message: `You sent: ${req.body.bar} in the body` });
// });
// app.delete("/foo", (req, res) => {
//     // etc.
//     res.sendStatus(200);
// });

// //
// // ASYNC/AWAIT EXAMPLE
// //

// function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
// // need async keyword on request handler to use await inside it
// app.get("/bar", async (req, res: FooResponse) => {
//     console.log("Waiting...");
//     // await is equivalent to calling sleep.then(() => { ... })
//     // and putting all the code after this in that func body ^
//     await sleep(3000);
//     // if we omitted the await, all of this code would execute
//     // immediately without waiting for the sleep to finish
//     console.log("Done!");
//     return res.sendStatus(200);
// });
// // test it out! while server is running:
// // curl http://localhost:3000/bar

interface Book {
    id: number;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}

interface Author {
    id: number;
    name: string;
    bio: string;
}

interface Success {
    success: string;
}

interface Error {
    error: string;
}

type AuthorResponse = Response<Author | Author[] | Success | Error>;
type BookResponse = Response<Book | Book[] | Success | Error>;

app.post("/authors", async (req, res: AuthorResponse) => {
    const { name, bio } = req.body;

    if (!name || !bio) {
        return res.status(400).json({ error: "Please enter a name and bio for the author" });
    }

    try {
        const result = await db.run("INSERT INTO authors (name, bio) VALUES (?, ?)",
            [name, bio]
        );

        const authorId = result.lastID;

        const author = await db.get("SELECT * FROM authors WHERE id = ?",
            [authorId]
        );

        return res.json(author);
    } catch (error) {
        console.error("Error creating author: ", error);
        return res.status(500).json({ error: "Failed to create author" });
    }
});

app.get("/authors", async (req, res: AuthorResponse) => {
    try {
        const authors = await db.all("SELECT * FROM authors");

        return res.json(authors);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch authors" });
    }
});

app.get("/authors/:id", async (req, res: AuthorResponse) => {
    const authorId = req.params.id;

    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?",
            [authorId]
        );

        if (!author) {
            return res.status(404).json({ error: "Cannot find author with that id" });
        }

        return res.json(author);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch author" });
    }
});

app.delete("/authors/:id", async (req, res: BookResponse) => {
    const authorId = req.params.id;

    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?",
            [authorId]
        );

        if (!author) {
            return res.status(404).json({ error: "Cannot find author with that id" });
        }

        const books = await db.all("SELECT * FROM books WHERE author_id = ?",
            [authorId]
        );

        if (books.length > 0) {
            return res.status(400).json({ error: "Cannot delete author with books associated with them" });
        }

        const result = await db.run("DELETE FROM authors WHERE id = ?",
            [authorId]
        );

        return res.json({ success: "Author deleted" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete author" });
    }
});

app.post("/books", async (req, res: BookResponse) => {
    const { author_id, title, pub_year, genre } = req.body;

    if (!author_id || !title || !pub_year || !genre) {
        return res.status(400).json({ error: "Please enter a author id, title, publication year and genre for the book" });
    }

    try {
        const author = await db.get("SELECT * FROM authors WHERE id = ?",
            [author_id]
        );

        if (!author) {
            return res.status(400).json({ error: "Author id does not exist" });
        }

        const result = await db.run("INSERT INTO books (author_id, title, pub_year, genre) VALUES (?, ?, ?, ?)",
            [author_id, title, pub_year, genre]
        );

        const bookId = result.lastID;

        const book = await db.get("SELECT * FROM books WHERE id = ?",
            [bookId]
        );

        return res.json(book);
    } catch (error) {
        return res.status(500).json({ error: "Failed to create a book" });
    }
});

app.get("/books", async (req, res: BookResponse) => {
    try {
        const books = await db.all("SELECT * FROM books");

        return res.json(books);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.get("/books/:year", async (req, res: BookResponse) => {
    const bookYear = req.params.year;

    try {
        const books = await db.all("SELECT * FROM books WHERE pub_year >= ?",
            [bookYear]);

        if (books.length === 0) {
            return res.status(404).json({ error: "No books found for that publication year or later" });
        }

        return res.json(books);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.get("/books/:id", async (req, res: BookResponse) => {
    const bookId = req.params.id;

    try {
        const book = await db.get("SELECT * FROM books WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({ error: "Cannot find book with that id" });
        }

        return res.json(book);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch book" });
    }
});

app.delete("/books/:id", async (req, res: BookResponse) => {
    const bookId = req.params.id;

    try {
        const book = await db.get("SELECT * FROM books WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({ error: "Cannot find book with that id" });
        }

        const result = await db.run("DELETE FROM books WHERE id = ?",
            [bookId]
        );

        return res.json({ success: "Book deleted" });
    } catch (error) {
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
