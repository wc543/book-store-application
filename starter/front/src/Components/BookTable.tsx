import { useState, useEffect } from "react";
import axios from "axios";
import "./BookTable.css";
import { getAxiosErrorMessages, Books } from "./utils";
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useCookies } from "react-cookie";

function BookTable() {
  const [messages, setMessages] = useState<string[]>([]);
  const [books, setBooks] = useState<Books[]>([]);
  const [bookFilter, setBookFilter] = useState<string>("");
  const [editingBook, setEditingBook] = useState<Books | null>(null);
  const [cookies] = useCookies(["token", "user_id"]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (cookies.token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [cookies.token]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("/api/books");
      setBooks(response.data);
      setMessages([]);
    } catch (error) {
      setMessages(getAxiosErrorMessages(error));
      setBooks([]);
    }
  };

  const handleDelete = async (id: number, author_id: number) => {
    if (isLoggedIn && cookies.user_id === author_id) {
      try {
        await axios.delete(`/api/books/${id}`);
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      } catch (error) {
        setMessages(getAxiosErrorMessages(error));
      }
    } else {
      setMessages(["You can only delete your own books."]);
    }
  };

  const handleEditClick = (book: Books) => {
    setMessages([]);
    setEditingBook(book);
  };

  const handleCancelEdit = () => {
    setMessages([]);
    setEditingBook(null);
  };

  const handleSaveEdit = async () => {
    setMessages([]);
    if (!editingBook) {
      return;
    }

    try {
      await axios.put(`/api/books/${editingBook.id}`, editingBook);
      setBooks((prevBooks) =>
        prevBooks.map((book) => (book.id === editingBook.id ? editingBook : book))
      );
      setEditingBook(null);
    } catch (error) {
      setMessages(getAxiosErrorMessages(error));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingBook) {
      return;
    }

    setEditingBook({
      ...editingBook,
      [e.target.name]: e.target.value,
    });
  };

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
            <TextField
              type="text"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              placeholder="Enter a year"
              variant="outlined"
              size="small"
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Publish Year</TableCell>
              <TableCell>Genre</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooks.map((book) =>
              editingBook && editingBook.id === book.id ? (
                <TableRow key={book.id}>
                  <TableCell>
                    <TextField
                      name="author_id"
                      value={editingBook.author_id}
                      onChange={handleInputChange}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField name="title" value={editingBook.title} onChange={handleInputChange} />
                  </TableCell>
                  <TableCell>
                    <TextField name="pub_year" value={editingBook.pub_year} onChange={handleInputChange} />
                  </TableCell>
                  <TableCell>
                    <TextField name="genre" value={editingBook.genre} onChange={handleInputChange} />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={handleSaveEdit}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={book.id}>
                  <TableCell>{book.author_id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.pub_year}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>
                    {isLoggedIn && cookies.user_id === book.author_id && (
                      <>
                        <IconButton color="primary" onClick={() => handleEditClick(book)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(book.id, book.author_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
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
