import React from "react";
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BookTable from "./Components/BookTable.tsx";
import AddAuthor from "./Components/AddAuthor.tsx";
import AddBook from "./Components/AddBook.tsx";
import NavBar from "./Components/NavBar.tsx";
import NotFound from "./Components/NotFound.tsx";

let router = createBrowserRouter([
  {
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <BookTable />,
      },
      {
        path: "/add-author",
        element: <AddAuthor />
      },
      {
        path: "/add-book",
        element: <AddBook />
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
