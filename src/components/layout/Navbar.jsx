import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-white text-lg">HawkerHub</Link>
        <div>
          <Link to="/deals" className="text-white mr-4">Deals</Link>
          <Link to="/group-orders" className="text-white">Group Orders</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

