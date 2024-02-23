import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header.tsx";
import Account from "./pages/Account.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Forgotpassword from "./pages/Forgotpassword.tsx";
import Notfound from "./pages/Notfound.tsx";
import Shipping from "./pages/Shipping.tsx";
import Signin from "./pages/Signin.tsx";
import { useProvinces } from "./stores/Provinces.ts";
function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setProvinces } = useProvinces();

    useEffect(() => {
        if (location.pathname === "/") {
            navigate("/signin");
        }
        fetch("/provinces.json").then((res) => {
            const parsed = res.json();
            parsed.then((data) => {
                setProvinces(data);
            });
        });
    }, []);

    const arrRoutes = ["/account", "/dashboard", "/customer", "/shipping", "/product", "/supplier", "/home"];
    return (
        <>
            {!arrRoutes.includes(location.pathname) ? (
                <Routes>
                    <Route path="/signin" element={<Signin />} />
                    <Route path="*" element={<Notfound />} />
                    <Route path="/forgotpassword" element={<Forgotpassword />} />
                </Routes>
            ) : (
                <>
                    <Header />
                    <Routes>
                        <Route path="/account" element={<Account />} />
                        <Route path="/home" element={<Navigate to="/dashboard" />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </>
            )}
        </>
    );
}

export default App;
