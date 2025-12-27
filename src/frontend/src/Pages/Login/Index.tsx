import React, { useState, useEffect } from "react";
import theme from "../../Config/Themes";
import { useNavigate } from "react-router-dom";

/* ************************************************************ Typage ************************************************************ */

interface AccueilProps {
  /*  Page de garde */
  gardeTitle?: string;
  gardeSubtitle?: string;

  /*   Page d'accueil */
  logo?: string;
  question?: string;
  connectButton?: string;
  copyright?: string;

  /* Typage de la transition */
  transitionDelay?: number;
}

// React Fonctionnal Component (RFC)

const Accueil: React.FC<AccueilProps> = ({
  // Possible Props déclarées ici en dur
  gardeTitle = "DataShare",
  gardeSubtitle = "« Nous gardons vos fichiers en toute sécurité »",
  logo = "DataShare",
  question = "Tu veux partager un fichier ?",
  connectButton = "Se connecter",
  copyright = "Copyright DataShare© 2025",
  transitionDelay = 2500,
}) => {
  /* ************************************************************ States ************************************************************ */

  const [showGarde, setShowGarde] = useState<boolean>(true);

  /* ************************************************************ Effects ************************************************************ */

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGarde(false);
    }, transitionDelay);

    return () => clearTimeout(timer);
  }, [transitionDelay]);

  /* ************************************************************ Fonctions ************************************************************ */

  const handleFileUpload = () => {
    console.log("Upload fichier");
  };
  const navigate = useNavigate();
  const handleConnect = () => {
    navigate("/Connexion");
  };

  /* ************************************************************ CSS Page de Garde ************************************************************ */

  const gardeContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: theme.gradients.main,
    fontFamily: theme.fonts.primary,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: "opacity 0.8s ease-in-out, visibility 0.8s ease-in-out",
    //Création de la condition pour rendre la page de garde Hidden / ! \ Opacity reste un div present au premier plan.
    visibility: showGarde ? "visible" : "hidden",
  };

  const textWrapperStyle: React.CSSProperties = {
    textAlign: "center",
    animation: "fadeIn 1s ease-in",
  };

  const gardeTitleStyle: React.CSSProperties = {
    fontSize: "clamp(3rem, 10vw, 7rem)",
    fontWeight: 700,
    color: theme.colors.black,
    fontFamily: theme.fonts.primary,
    marginBottom: "20px",
  };

  const gardeSubtitleStyle: React.CSSProperties = {
    fontSize: "clamp(1.2rem, 3vw, 2rem)",
    fontWeight: 400,
    fontStyle: "italic",
    color: theme.colors.black,
    fontFamily: theme.fonts.primary,
  };

  /* ************************************************************ CSS Page d'Acceuil ************************************************************ */
  const [hover, setHover] = React.useState(false);

  const pageContainer: React.CSSProperties = {
    height: "100vh",
    background: theme.gradients.main,
    fontFamily: theme.fonts.primary,
    display: "flex",
    flexDirection: "column",
    opacity: showGarde ? 0 : 1,
    transition: "opacity 0.8s ease-in-out",
  };

  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
  };

  const logostyle: React.CSSProperties = {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: theme.colors.black,
    fontFamily: theme.fonts.primary,
  };
  const connectButtonstyle: React.CSSProperties = {
    padding: "12px 28px",
    background: hover ? "#1a202c" : "#2d3748",
    color: theme.colors.white,
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: hover ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontFamily: theme.fonts.primary,
  };
  const mainContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "40px 20px",
  };

  const title: React.CSSProperties = {
    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
    fontWeight: 400,
    color: theme.colors.black,
    marginBottom: "40px",
    textAlign: "center",
    fontFamily: theme.fonts.primary,
  };

  const uploadButtonContainer: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const footer: React.CSSProperties = {
    padding: "20px 40px",
  };

  const copyrightstyle: React.CSSProperties = {
    fontSize: "0.95rem",
    color: theme.colors.black,
    opacity: 0.8,
    fontFamily: theme.fonts.primary,
  };

  return (
    <>
      {/*Page de garde  */}
      <div style={gardeContainer}>
        <div style={textWrapperStyle}>
          <h1 style={gardeTitleStyle}>{gardeTitle}</h1>
          <h2 style={gardeSubtitleStyle}>{gardeSubtitle}</h2>
        </div>
      </div>

      {/*Page d'accueil  */}
      <div style={pageContainer}>
        <header style={header}>
          <h1 style={logostyle}>{logo}</h1>
          <button style={connectButtonstyle} onClick={handleConnect} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {connectButton}
          </button>
        </header>

        <main style={mainContainer}>
          <h2 style={title}>{question}</h2>

          <div style={uploadButtonContainer}>
            <div></div>
          </div>
        </main>

        {/* Footer */}
        <footer style={footer}>
          <p style={copyrightstyle}>{copyright}</p>
        </footer>
      </div>
    </>
  );
};

export default Accueil;
