import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { AuthProvider } from "./Helpers/AuthContext";
//Import des pages

import Login from "./Pages/Login/Index";
import Profil from "./Pages/Profil/Index";
import Televersement from "./Pages/Televersement/Index";
import Default from "./Pages/Default/Index";
import { createBrowserHistory } from "history";
import Connexion from "./Pages/Connexion/Index";
import Register from "./Pages/Inscription";

const history = createBrowserHistory();
function App() {
  return (
    <AuthProvider>
      <section className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/Televersement" element={<Televersement />} />
            <Route path="/Connexion" element={<Connexion />} />

            <Route path="/Register" element={<Register />} />

            <Route path="*" element={<Default />} />
          </Routes>
        </BrowserRouter>
      </section>
    </AuthProvider>
  );
}

export default App;
