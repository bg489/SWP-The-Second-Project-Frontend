import { BrowserRouter } from "react-router-dom";
import { MockAuthProvider } from "./context/MockAuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
  return (
    <MockAuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MockAuthProvider>
  );
}

export default App;