import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "./NavBar.css";

function Header() {
  return (
    <>
      <Link to="/">Books</Link>
    </>
  );
}

function NavBar() {
  const [cookies] = useCookies(["token", "user_id"]);
  const navigate = useNavigate();
  const isLoggedIn = !!cookies.token;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <>
      <nav>
        <Header />
        {isLoggedIn && (
          <>
            <Link to="/add-author">Add Author</Link>
            <Link to="/add-book">Add Book</Link>
          </>
        )}
        {isLoggedIn ? (
          <button onClick={handleLogout}>Sign Out</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default NavBar;
