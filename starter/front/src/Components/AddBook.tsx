import "./AddBook.css";
import { useState } from "react";
import { getAxiosErrorMessages } from "./utils";

function AddBook() {
  let [messages, setMessages] = useState<string[]>([]);
  let [authorId, setAuthorId] = useState("");
  let [title, setTitle] = useState("");
  let [pubYear, setPubYear] = useState("");
  let [genre, setGenre] = useState("");

  let handleSubmit = async function () {
    try {
      const book = {
        author_id: authorId,
        title: title,
        pub_year: pubYear,
        genre: genre
      }

      console.table(book);

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
      });

      if (response.ok) {
        setMessages(["Book successfully added"]);
      } 

      else {
        setMessages(["Error adding book"])
      }
    } catch (error) {
      setMessages(getAxiosErrorMessages(error));
    }
  };

  return (
    <>
      <h2>Add a book</h2>
      <div id="book-form">
        <label>
          Enter Author ID:
          <input
            type="text"
            name="author_id"
            value={authorId}
            onChange={(e) => {
              setAuthorId(e.target.value);
            }}
          ></input>
        </label>

        <label>
          Enter Title:
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          ></input>
        </label>

        <label>
          Enter Publish Year:
          <input
            type="text"
            name="pub_year"
            value={pubYear}
            onChange={(e) => {
              setPubYear(e.target.value);
            }}
          ></input>
        </label>

        <label>
          Enter genre:
          <input
           type="text"
            name="genre"
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
            }}
          ></input>
        </label>

        <button onClick={handleSubmit}>Add Book</button>
        <div className="error-message">
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AddBook;
