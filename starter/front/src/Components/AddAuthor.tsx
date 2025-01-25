import "./AddAuthor.css";
import { useState } from "react";
import { getAxiosErrorMessages } from "./utils";

function AddAuthor() {
  let [messages, setMessages] = useState<string[]>([]);
  let [name, setName] = useState("");
  let [bio, setBio] = useState("");

  let handleSubmit = async function () {
    try {
      const author = {
        name: name,
        bio: bio
      }

      console.table(author);

      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(author)
      });

      if (response.ok) {
        setMessages(["Author successfully added"]);
      } 

      else {
        setMessages(["Error adding author"])
      }
    } catch (error) {
      setMessages(getAxiosErrorMessages(error));
    }
  };

  return (
    <>
      <h2>Add an author</h2>
      <div id="author-form">

        <label>
          Enter Name:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></input>
        </label>


        <label>
          Enter Bio:
          <textarea 
            name="bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
            }}
          ></textarea>
        </label>

        <button onClick={handleSubmit}>Add Author</button>
        <div className="error-message">
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AddAuthor;
