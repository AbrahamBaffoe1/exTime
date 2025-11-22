import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext/AuthContext';
import './Navbar.css';

const Navbar = ({ navItems }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" className="logo">
            exTime
          </NavLink>
        </div>

        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="navbar-actions">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName
                ? user.firstName.charAt(0).toUpperCase()
                : user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`.trim()
                  : user?.username || 'User'}
              </span>
              <span className="user-status">
                <span className="status-dot"></span>
                Active
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;