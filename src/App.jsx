import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { refreshSessionRequest } from "./features/backend/auth/authSlice";
import { MockAuthProvider } from "./context/MockAuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const AuthBootstrap = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      dispatch(refreshSessionRequest());
    }
  }, [dispatch]);

  return null;
};

function App() {
  return (
    <MockAuthProvider>
      <AuthBootstrap />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MockAuthProvider>
  );
}

export default App;
