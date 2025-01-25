import { useState, useEffect } from "react";
import axios from "axios";
import "./BookTable.css";
import { getAxiosErrorMessages, Books } from "./utils";


function BookTable() {
  const [messages, setMessages] = useState<string[]>([]);
  const [books, setBooks] = useState<Books[]>([]);
  const [bookFilter, setBookFilter] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const books = await axios.get("/api/books");
        setBooks(books.data);
        setMessages([]);
      } catch (error) {
        setMessages(getAxiosErrorMessages(error));
        setBooks([]);
      }
    })();
  }, []);

  const filteredBooks = books.filter((book) => {
    return !bookFilter || book.pub_year >= bookFilter;
  });

  return (
    <>
      <h2>See all books</h2>
      <div id="book-table">
        <div>
          <label>
            Filter by Publication Year (greater than or equal to):
            <input
              type="text"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              placeholder="Enter a year"
            />
          </label>
        </div>
        {filteredBooks.length === 0 ? (
          <div>No books found matching the filter.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Author ID</th>
                <th>Title</th>
                <th>Publish Year</th>
                <th>Genre</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(({ id, author_id, title, pub_year, genre }) => (
                <tr key={id}>
                  <td>{author_id}</td>
                  <td>{title}</td>
                  <td>{pub_year}</td>
                  <td>{genre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div>
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
    </>
  );
}

export default BookTable;
