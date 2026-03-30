import { Link, NavLink } from 'react-router-dom'

const Layout = ({ children }) => {
  return (
    <div className="shell">
      <header className="hero">
        <div>
          <Link to="/" className="brand">GroceryList Studio</Link>
          <p className="hero-copy">
            Build share-ready grocery plans with live totals, category-aware styling, and fast edit flows.
          </p>
        </div>
        <nav className="nav">
          <NavLink to="/" className="nav-link">All Lists</NavLink>
          <NavLink to="/lists/new" className="nav-link">New List</NavLink>
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  )
}

export default Layout
