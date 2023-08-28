import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Signin from "./pages/Signin.tsx";
import Notfound from "./pages/Notfound.tsx";
import Home from "./pages/Home.tsx";
import Shipping from "./pages/Shipping.tsx";
import Header from "./components/Header.tsx";
import Body from "./components/Body.tsx";
import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="*" element={<Notfound />} />
      <Route path="/home" element={<Home />} />
      <Route path="/shipping" element={<Shipping />} />
    </Routes>
  </BrowserRouter>

  //</React.StrictMode>,
);
