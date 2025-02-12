import "./Login.css";
import { useState } from "react";
import { getAxiosErrorMessages } from "./utils";

function Login() {
    let [messages, setMessages] = useState<string[]>([]);
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");

    let handleSubmit = async function () {
        try {
          const user = {
            username: username,
            password: password
          }
    
          console.table(user);

          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
          });
    
          if (response.ok) {
            setMessages(["User successfully Logged in"]);
          } 
    
          else {
            const err = await response.json();
            setMessages([err.error || "Error Logging in"]);
          }

        } catch (error) {
          setMessages(getAxiosErrorMessages(error));
        }
      };

    return (
        <>
        <h2>Login</h2>
        <div id="login-form">

        <label>
          Enter Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          ></input>
        </label>


        <label>
          Enter Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></input>
        </label>

        <button onClick={handleSubmit}>Register</button>
        <div className="error-message">
          {messages.map((message, i) => (
            <div key={i}>{message}</div>
          ))}
        </div>
      </div>
        </>
    )
}

export default Login;