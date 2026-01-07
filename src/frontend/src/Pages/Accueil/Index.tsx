import React, { useState, useEffect } from "react";
import theme from "../../Config/Themes/Index";
import FileUpload from "../../Components/Upload";
import { useAuth } from "../../Helpers/AuthContext";
import Footer from "../../Components/Footer/Index";
import Header from "../../Components/Header/Index";

import { ReactComponent as UploadIcon } from "../../Assets/Logo.svg";
/* ************************************************************ Typage ************************************************************ */

interface AccueilProps {
  /*  Page de garde */
  gardeTitle?: string;
  gardeSubtitle?: string;

  /*   Page d'accueil */

  question?: string;
  connectButton?: string;

  /* Typage de la transition */
  transitionDelay?: number;
}

// React Fonctionnal Component (RFC)

const Accueil: React.FC<AccueilProps> = ({
  // Possible Props déclarées ici en dur
  gardeTitle = "DataShare",
  gardeSubtitle = "« Nous gardons vos fichiers en toute sécurité »",
  question = "Tu veux partager un fichier ?",

  transitionDelay = 1500,
}) => {
  /* ************************************************************ States ************************************************************ */

  const [showGarde, setShowGarde] = useState<boolean>(true);

  // Upload de fichiers
  const [isUploadOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const [userId, setUserId] = useState<number | undefined>(undefined);

  const [headerButtonHover, setHeaderButtonHover] = useState(false);

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const [buttonshareActived, setbuttonshareActived] = useState(false);

  const auth = useAuth();

  const { authState } = useAuth();
  /* ************************************************************ Effects ************************************************************ */

  useEffect(() => {
    if (authState.status) {
      setShowGarde(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowGarde(false);
    }, transitionDelay);

    return () => clearTimeout(timer);
  }, [transitionDelay, authState.status]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /* ************************************************************ Fonctions ************************************************************ */

  //Upload de fichiers

  const handleFileUpload = () => {
    if (isMobile) {
      setbuttonshareActived(true);
      setIsUploadModalOpen(true);
    } else {
      setIsUploadModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (isMobile) {
      setbuttonshareActived(false);
      setIsUploadModalOpen(false);
    } else {
      setIsUploadModalOpen(false);
    }
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
    //Création de la condition pour rendre la page de garde Hidden / ! \ !Opacity car dasn ce cas il reste un div present au premier plan.
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
    fontSize: "clamp(1.1rem, 3vw, 2rem)",
    fontWeight: 400,
    fontStyle: "italic",
    color: theme.colors.black,
    fontFamily: theme.fonts.primary,
  };

  /* ************************************************************ CSS Page d'Acceuil ************************************************************ */
  const [uploadHover2, setUploadHover2] = React.useState(false);

  /* ***********************  Header Style   * ********************** */
  const logoStyle: React.CSSProperties = {
    fontSize: "2rem",
    color: theme.colors.black,
    marginBottom: "40px",
  };

  const ButtonStyle: React.CSSProperties = {
    padding: "clamp(8px, 3vw, 12px) clamp(16px, 4vw, 28px)",
    background: headerButtonHover ? "#1a202c" : "#2d3748",
    color: theme.colors.white,
    border: "none",
    borderRadius: "8px",
    fontSize: "clamp(0.85rem, 2vw, 1rem)",
    letterSpacing: "0.1px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: headerButtonHover ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontFamily: theme.fonts.primary,
    transform: headerButtonHover ? "translateY(-2px)" : "translateY(0)",
    whiteSpace: "nowrap",
  };
  /* ***********************  Fin Header Style   * ********************** */
  const pageContainer: React.CSSProperties = {
    minHeight: "100vh",
    width: "100%",
    background: theme.gradients.main,
    fontFamily: theme.fonts.primary,
    display: "flex",
    flexDirection: "column",
    opacity: showGarde ? 0 : 1,
    transition: "opacity 0.8s ease-in-out",
  };

  const mainContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "clamp(20px, 5vw, 40px) 20px",
    marginBottom: isMobile ? "140px" : "0px",
  };

  const title: React.CSSProperties = {
    fontSize: "clamp(1.9rem, 4vw, 2.5rem)",
    fontWeight: 400,
    color: theme.colors.black,
    marginBottom: "40px",
    textAlign: "center",
    fontFamily: theme.fonts.primary,
  };

  const uploadButtonContainerStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const uploadButtonOuterStyle: React.CSSProperties = {
    width: "clamp(100px, 25vw, 140px)",
    height: "clamp(100px, 25vw, 140px)",
    borderRadius: "50%",
    background: uploadHover2 ? "rgba(45, 55, 72, 0.25)" : "rgba(45, 55, 72, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    transform: uploadHover2 ? "scale(1.05)" : "scale(1)",
  };

  const uploadButtonInnerStyle: React.CSSProperties = {
    width: "clamp(70px, 18vw, 100px)",
    height: "clamp(70px, 18vw, 100px)",
    borderRadius: "50%",
    background: "#100218",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",

    boxShadow: "none",
  };
  /* ***********************  Footer Style   * ********************** */
  const footerStyle: React.CSSProperties = {
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)",
    flexShrink: 0,
    display: isMobile ? "none" : "block",
  };

  const copyrightStyle: React.CSSProperties = {
    fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
    color: theme.colors.white,
    opacity: 0.8,
    margin: 0,
    fontFamily: theme.fonts.primary,
  };

  /* ***********************  Fin Footer Style   * ********************** */

  /* ************************************************************ Rendu ************************************************************ */

  return (
    <>
      {/*Page de garde  */}
      {!authState.status && (
        <div style={gardeContainer}>
          <div style={textWrapperStyle}>
            <h1 style={gardeTitleStyle}>{gardeTitle}</h1>
            <h2 style={gardeSubtitleStyle}>{gardeSubtitle}</h2>
          </div>
        </div>
      )}

      {/*Page d'accueil  */}
      <div style={pageContainer}>
        <Header logoStyle={logoStyle} buttonStyle={ButtonStyle} />
        {!buttonshareActived && (
          <main style={mainContainer}>
            <h2 style={title}>{question}</h2>

            <div style={uploadButtonContainerStyle}>
              {/*      / ! \ Si un bouton est créé en dessous il herite d'une ombre porté. */}
              <div style={uploadButtonOuterStyle} onClick={handleFileUpload} onMouseEnter={() => setUploadHover2(true)} onMouseLeave={() => setUploadHover2(false)}>
                <div style={uploadButtonInnerStyle}>
                  <UploadIcon
                    style={{
                      width: "clamp(45px, 12vw, 70px)",
                      height: "clamp(45px, 12vw, 70px)",
                      color: "white",
                    }}
                  />
                </div>
              </div>
            </div>
          </main>
        )}
        {/*******************************************************   Composant  Upload  *******************************************************/}
        {/*   Test : passage du composant en visible ou none au lieu d'un state dans le composant parent => A voir si cette approche complique l'étape des tests*/}
        <FileUpload isOpen={isUploadOpen} onClose={handleCloseModal} userId={userId} />
        <Footer containerStyle={footerStyle} textStyle={copyrightStyle} />
      </div>
    </>
  );
};

export default Accueil;
