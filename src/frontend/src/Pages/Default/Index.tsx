// src/Pages/Default/Index.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Default = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div data-testid="default-page" onClick={handleHome} style={{ cursor: "pointer" }}>
      <h1>Retour à la page d'accueil</h1>
      <p>Cliquez ici pour revenir à l'accueil</p>
    </div>
  );
};

export default Default;
