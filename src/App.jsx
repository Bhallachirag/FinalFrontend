// import React from "react";
import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider.jsx';
import HomePage from './pages/HomePage.jsx';
import MyOrders from './pages/MyOrders.jsx';
import AdminPage from './pages/AdminPage.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;