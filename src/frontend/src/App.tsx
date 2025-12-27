
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
//Import des pages
import Garde from "./Pages/Garde/Index";
import Login from "./Pages/Login/Index";
import Profil from "./Pages/Profil/Index";
import Televersement from "./Pages/Televersement/Index";
import Default from "./Pages/Default/Index";



function App() {
  const [authState, setAuthState] = useState({
    firstname: "",
    lastname: "",
    id: 0,
    photo_: "",
    login: "",
    status: false
  });

  return (
    <section className="container">

<BrowserRouter>
  <Routes>
          <Route path="/" element={<Garde />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/Televersement" element={<Televersement />} />
          
            <Route path="*" element={<Default />} />
  </Routes>
</BrowserRouter>
    </section>
  );
}

export default App;
