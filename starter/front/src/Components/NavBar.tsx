import { Link, Outlet } from "react-router-dom";
import "./NavBar.css";

function Header() {
  return (
    <>
      <Link to="/">Books</Link>
      <Link to="/add-author">Add Author</Link>
      <Link to="/add-book">Add Book</Link>
    </>
  );
}

function NavBar() {
  return (
    <>
      <nav>
        <Header />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default NavBar;
