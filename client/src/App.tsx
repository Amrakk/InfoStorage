import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useLocation, useNavigate } from "react-router-dom";
import Signin from "./pages/Signin.tsx";
import Notfound from "./pages/Notfound.tsx";
import Home from "./pages/Home.tsx";
import Shipping from "./pages/Shipping.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Header from "./components/Header.tsx";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/signin");
    }
  }, []);

  const arrRoutes = [
    "/dashboard",
    "/customer",
    "/shipping",
    "/product",
    "/supplier",
  ];
  return (
    <>
      {!arrRoutes.includes(location.pathname) ? (
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      ) : (
        <>
          <Header />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
