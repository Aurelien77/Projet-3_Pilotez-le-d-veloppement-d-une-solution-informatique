
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect, useState } from "react";
//Import des pages

import Login from "./Pages/Login/Index";
import Profil from "./Pages/Profil/Index";
import Televersement from "./Pages/Televersement/Index";
import Default from "./Pages/Default/Index";
import { createBrowserHistory } from 'history';
import Connexion from "./Pages/Connexion/Index";


const history = createBrowserHistory();
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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/Televersement" element={<Televersement />} />
           <Route path="/Connexion" element={<Connexion />} />
          
         
          <Route path="*" element={<Default />} />
  </Routes>
</BrowserRouter>
    </section>
  );
}

export default App;
