import React, { useState } from "react";
import theme from "../../Config/Themes/Index";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Helpers/AuthContext";
import Header from "../../Components/Header/Index";
import Footer from "../../Components/Footer/Index";

/* ************************************************************ Typage ************************************************************ */

interface ConnexionProps {
  logoText?: string;
  titleText?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  createAccountText?: string;
  submitButtonText?: string;
}

interface LoginResponse {
  message: string;
  userId: number;
  token: string;
}

// React Fonctionnal Component (RFC)

const Connexion: React.FC<ConnexionProps> = ({ logoText = "DataShare", titleText = "Connexion", emailLabel = "Email", emailPlaceholder = "Saisissez votre email...", passwordLabel = "Mot de passe", passwordPlaceholder = "Saisissez votre mot de passe...", createAccountText = "Créer un compte", submitButtonText = "Se connecter" }) => {
  /* ************************************************************ States ************************************************************ */

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [headerButtonHover, setHeaderButtonHover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Récupère la fonction login du Context

  /* ************************************************************ Fonctions ************************************************************ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser le message d'erreur
    setErrorMessage("");
    setIsLoading(true);

    const dataforsend = {
      email,
      password,
    };
    console.log(dataforsend, "DATA ENVOYEES");
    try {
      const response = await fetch("https://localhost:7120/api/Users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", //Permet de recevoir le cookie
        body: JSON.stringify(dataforsend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur:", errorData);
        setErrorMessage(errorData.message || "Une erreur est survenue lors de la connexion");
        setIsLoading(false);
        return;
      }

      const data: LoginResponse = await response.json();

      // Mettre à jour le state global d'authentification
      login({
        id: data.userId,
        status: true,
      });

      // Rediriger vers la page profil

      navigate("/Profil");
    } catch (error) {
      console.error("Erreur lors du POST :", error);
      setErrorMessage("Erreur de connexion au serveur. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/Register");
  };

  /* ************************************************************ CSS ************************************************************ */

  const pageContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    width: "100%",
    background: theme.gradients.main,
    fontFamily: theme.fonts.primary,
    display: "flex",
    flexDirection: "column",
  };

  /* ***********************  Header Style   * ********************** */
  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 900,
    color: theme.colors.black,
    marginBottom: "40px",
  };

  const ButtonStyle: React.CSSProperties = {
    padding: "clamp(8px, 2vw, 12px) clamp(16px, 4vw, 28px)",
    background: headerButtonHover ? "#1a202c" : "#2d3748",
    color: theme.colors.white,
    border: "none",
    borderRadius: "8px",
    fontSize: "clamp(0.85rem, 2vw, 1rem)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: headerButtonHover ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontFamily: theme.fonts.primary,
    transform: headerButtonHover ? "translateY(-2px)" : "translateY(0)",
    whiteSpace: "nowrap",
  };
  /* ***********************  Fin Header Style   * ********************** */
  const mainContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "clamp(20px, 5vw, 40px) clamp(15px, 3vw, 20px)",
    minHeight: "0",
  };

  const formStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "clamp(15px, 3vw, 20px)",
    padding: "clamp(30px, 6vw, 50px) clamp(25px, 5vw, 60px)",
    width: "100%",
    maxWidth: "550px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  };

  const formTitleStyle: React.CSSProperties = {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 700,
    color: theme.colors.black,
    textAlign: "center",
    marginBottom: "clamp(25px, 5vw, 40px)",
    fontFamily: theme.fonts.primary,
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "clamp(18px, 4vw, 25px)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "clamp(0.9rem, 2vw, 1rem)",
    fontWeight: 500,
    color: theme.colors.black,
    marginBottom: "clamp(8px, 2vw, 10px)",
    fontFamily: theme.fonts.primary,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(12px, 3vw, 14px) clamp(14px, 3vw, 18px)",
    fontSize: "clamp(0.9rem, 2vw, 1rem)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    backgroundColor: "white",
    boxSizing: "border-box",
  };

  const createAccountLinkStyle: React.CSSProperties = {
    display: "block",
    textAlign: "center",
    color: "#d97706",
    fontSize: "clamp(0.9rem, 2vw, 1rem)",
    marginTop: "clamp(15px, 3vw, 20px)",
    marginBottom: "clamp(18px, 4vw, 25px)",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: theme.fonts.primary,
    transition: "all 0.3s ease",
  };

  const submitButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(12px, 3vw, 14px)",
    background: isLoading ? "rgba(217, 119, 6, 0.3)" : "rgba(217, 119, 6, 0.15)",
    color: "#d97706",
    border: "2px solid rgba(217, 119, 6, 0.3)",
    borderRadius: "8px",
    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
    fontWeight: 600,
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    opacity: isLoading ? 0.7 : 1,
  };

  const errorMessageStyle: React.CSSProperties = {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 15px)",
    marginBottom: "clamp(15px, 3vw, 20px)",
    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
    color: "#dc2626",
    fontFamily: theme.fonts.primary,
    fontWeight: 500,
    display: errorMessage ? "block" : "none",
  };
  /* ***********************  Footer Style   * ********************** */
  const footerStyle: React.CSSProperties = {
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)",
    flexShrink: 0,
  };

  const copyrightStyle: React.CSSProperties = {
    fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
    color: theme.colors.black,
    opacity: 0.8,
    margin: 0,
    fontFamily: theme.fonts.primary,
  };
  /* ***********************  Fin Footer Style   * ********************** */

  return (
    <div style={pageContainerStyle}>
      <Header logoStyle={logoStyle} logoText={logoText} buttonStyle={ButtonStyle} />

      {/* Main formulaire */}
      <main style={mainContainerStyle}>
        <div style={formStyle}>
          <h2 style={formTitleStyle}>{titleText}</h2>

          {/* Message d'erreur */}
          {errorMessage && <div style={errorMessageStyle}>⚠️ {errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>{emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={emailPlaceholder}
                style={inputStyle}
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#d97706";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 119, 6, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>{passwordLabel}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passwordPlaceholder}
                style={inputStyle}
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#d97706";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 119, 6, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Créer un compte bouton*/}
            <span
              style={createAccountLinkStyle}
              onClick={handleCreateAccount}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
                e.currentTarget.style.color = "#b45309";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
                e.currentTarget.style.color = "#d97706";
              }}
            >
              {createAccountText}
            </span>

            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "rgba(217, 119, 6, 0.25)";
                  e.currentTarget.style.borderColor = "#d97706";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "rgba(217, 119, 6, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.3)";
                }
              }}
            >
              {isLoading ? "Connexion en cours..." : submitButtonText}
            </button>
          </form>
        </div>
      </main>
      <Footer containerStyle={footerStyle} textStyle={copyrightStyle} />
    </div>
  );
};

export default Connexion;
