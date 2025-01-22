import axios, { AxiosError } from "axios";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;

// test("GET /foo?bar returns message", async () => {
//     let bar = "xyzzy";
//     let { data } = await axios.get(`${baseUrl}/foo?bar=${bar}`);
//     expect(data).toEqual({ message: `You sent: ${bar} in the query` });
// });

// test("GET /foo returns error", async () => {
//     try {
//         await axios.get(`${baseUrl}/foo`);
//     } catch (error) {
//         // casting needed b/c typescript gives errors "unknown" type
//         let errorObj = error as AxiosError;
//         // if server never responds, error.response will be undefined
//         // throw the error so typescript can perform type narrowing
//         if (errorObj.response === undefined) {
//             throw errorObj;
//         }
//         // now, after the if-statement, typescript knows
//         // that errorObj can't be undefined
//         let { response } = errorObj;
//         // TODO this test will fail, replace 300 with 400
//         expect(response.status).toEqual(300);
//         expect(response.data).toEqual({ error: "bar is required" });
//     }
// });

// test("POST /bar works good", async () => {
//     let bar = "xyzzy";
//     let result = await axios.post(`${baseUrl}/foo`, { bar });
//     expect(result.data).toEqual({ message: `You sent: ${bar} in the body` });
// });

test("Post /authors creates a new author", async() => {
    const author = { name: "Bob", bio: "Author of Bob's Construction" };

    let { data } = await axios.post(`${baseUrl}/authors`, author);

    expect(data.id).toEqual(1);
    expect(data.name).toEqual(author.name);
    expect(data.bio).toEqual(author.bio);
});

test("Delete /authors/:id should delete the author if no books are associated with them", async () => {
    const authorId = 1;

    let result = await axios.delete(`${baseUrl}/authors/${authorId}`);

    expect(result.status).toEqual(200);
    expect(result.data).toEqual({ success: "Author deleted" });
})

test("GET /authors should return a list of authors", async () => {
    const author1 = { name: "J.K. Rowling", bio: "Author of Harry Potter" };
    await axios.post(`${baseUrl}/authors`, author1);

    const author2 = { name: "George Orwell", bio: "Author of 1984 and Animal Farm" };
    await axios.post(`${baseUrl}/authors`, author2);

    const authors = [
        { id: 2, name: "J.K. Rowling", bio: "Author of Harry Potter" },
        { id: 3, name: "George Orwell", bio: "Author of 1984 and Animal Farm" }
    ];

    let { data } = await axios.get(`${baseUrl}/authors`);

    expect(data).toEqual(expect.arrayContaining(authors));
});

test("GET /books/:id should return the author with the given id", async () => {
    const author = { name: "J.K. Rowling", bio: "Author of Harry Potter" };

    const authorId = 2;

    let { data } = await axios.get(`${baseUrl}/authors/${authorId}`);

    expect(data.id).toEqual(2);
    expect(data.name).toEqual(author.name);
    expect(data.bio).toEqual(author.bio);
});

test("GET /authors/:id should return 404 if author not found", async () => {
    const invalidId = 1234;

    try {
        await axios.get(`${baseUrl}/authors/${invalidId}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj

        expect(response.status).toEqual(404);
        expect(response.data).toEqual({ error: "Cannot find author with that id" });
    }
});

test("POST /books creates a new book with author_id 2", async () => {
    const book = {author_id: 2, title: "1984", pub_year: "1949", genre: "Dystopian"};

    let { data } = await axios.post(`${baseUrl}/books`, book);

    expect(data.id).toEqual(1);
    expect(data.author_id).toEqual(book.author_id);
    expect(data.title).toEqual(book.title);
    expect(data.pub_year).toEqual(book.pub_year);
    expect(data.genre).toEqual(book.genre);
});

test("Delete /authors/:id should not delete the author if books are associated with them", async () => {
    const authorId = 2;

    try {
        await axios.delete(`${baseUrl}/authors/${authorId}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj

        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Cannot delete author with books associated with them" });
    }
});

test("GET /books/:year should return books published on or after the given year", async () => {
    const book1 = { author_id: 2, title: "Harry Potter and the Philosopher's Stone", pub_year: "1997", genre: "Fantasy" };
    await axios.post(`${baseUrl}/books`, book1);

    const book2 = { author_id: 3, title: "1984", pub_year: "1949", genre: "Dystopian" };
    await axios.post(`${baseUrl}/books`, book2);

    const books = [
        { id: 2, author_id: 2, title: "Harry Potter and the Philosopher's Stone", pub_year: "1997", genre: "Fantasy" },
        { id: 3, author_id: 3, title: "1984", pub_year: "1949", genre: "Dystopian" }
    ];

    const year = "1949";

    let { data } = await axios.get(`${baseUrl}/books/${year}`);

    expect(data).toEqual(expect.arrayContaining(books));
});

test("GET /books/:year should return a 404 error if no books are found for the given year", async () => {
    const year = "2100";

    try {
        await axios.get(`${baseUrl}/books/${year}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj

        expect(response.status).toEqual(404);
        expect(response.data).toEqual({ error: "No books found for that publication year or later" });
    }
});