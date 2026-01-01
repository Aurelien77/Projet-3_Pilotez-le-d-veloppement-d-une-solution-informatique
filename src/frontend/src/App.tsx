import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Helpers/AuthContext";
//Import des pages

import Login from "./Pages/Accueil/Index";
import Default from "./Pages/Default/Index";
import Connexion from "./Pages/Connexion/Index";
import Register from "./Pages/Inscription";
import Usersfiles from "./Pages/UsersFiles/Index";
import DowladdFile from "./Pages/DowloadFiles/Index";

function App() {
  return (
    <AuthProvider>
      <section className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profil" element={<Usersfiles />} />
            <Route path="/Connexion" element={<Connexion />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/download/:fileId" element={<DowladdFile />} />
            <Route path="*" element={<Default />} />
          </Routes>
        </BrowserRouter>
      </section>
    </AuthProvider>
  );
}

export default App;
