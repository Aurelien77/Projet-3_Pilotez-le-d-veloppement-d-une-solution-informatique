import React, { useState } from "react";
import theme from "../../Config/Themes";
import { useNavigate } from "react-router-dom";

/* ************************************************************ Typage ************************************************************ */

interface InscriptionProps {
  logoText?: string;
  titleText?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  alreadyAccountText?: string;
  submitButtonText?: string;
  copyrightText?: string;
}

interface UserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  login: string | null;
  picture: string | null;
  createdAt: string;
  password: string;
}

// React Fonctionnal Component (RFC)

const Register: React.FC<InscriptionProps> = ({
  logoText = "DataShare",
  titleText = "Créer un compte",
  emailLabel = "Email",
  emailPlaceholder = "Saisissez votre email...",
  passwordLabel = "Mot de passe",
  passwordPlaceholder = "Saisissez votre mot de passe...",
  confirmPasswordLabel = "Verification du mot de passe",
  confirmPasswordPlaceholder = "Saisissez le à nouveau",
  alreadyAccountText = "J'ai déjà un compte",
  submitButtonText = "Créer mon compte",
  copyrightText = "Copyright DataShare© 2025",
}) => {
  /* ************************************************************ States ************************************************************ */

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [headerButtonHover, setHeaderButtonHover] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [continueButtonHover, setContinueButtonHover] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();

  /* ************************************************************ Fonctions ************************************************************ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser le message d'erreur
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    const dataforsend = {
      email,
      password,
      firstName: "MyFirstname",
      lastName: "MyLastname",
      login: "MyLogin",
      picture: "MyPicture",
    };

    try {
      const response = await fetch("https://localhost:7120/api/Users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataforsend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur:", errorData);

        // Afficher le message d'erreur du backend
        setErrorMessage(errorData.message || "Une erreur est survenue lors de l'inscription");
        return;
      }

      const data: UserResponse = await response.json();
      console.log("Inscription réussie :", data);

      // Afficher le popup de succès
      setUserData(data);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Erreur lors du POST :", error);
      setErrorMessage("Erreur de connexion au serveur. Veuillez réessayer.");
    }
  };

  const handleAlreadyAccount = () => {
    navigate("/Connexion");
  };

  const handleContinueToLogin = () => {
    navigate("/Connexion");
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

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)",
    flexShrink: 0,
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
    fontWeight: 900,
    color: theme.colors.black,
    letterSpacing: "-1px",
    fontFamily: theme.fonts.primary,
  };

  const connectButtonStyle: React.CSSProperties = {
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

  const alreadyAccountLinkStyle: React.CSSProperties = {
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
    background: "rgba(217, 119, 6, 0.15)",
    color: "#d97706",
    border: "2px solid rgba(217, 119, 6, 0.3)",
    borderRadius: "8px",
    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
  };

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

  // popup + overlay
  const popupOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: showSuccessPopup ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const popupContainerStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.98)",
    borderRadius: "clamp(15px, 3vw, 20px)",
    padding: "clamp(30px, 6vw, 50px) clamp(25px, 5vw, 60px)",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "fadeIn 0.3s ease-in",
  };

  const popupTitleStyle: React.CSSProperties = {
    fontSize: "clamp(1.5rem, 4vw, 1.8rem)",
    fontWeight: 700,
    color: "#16a34a",
    textAlign: "center",
    marginBottom: "clamp(20px, 4vw, 30px)",
    fontFamily: theme.fonts.primary,
  };

  const popupTextStyle: React.CSSProperties = {
    fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
    color: theme.colors.black,
    textAlign: "center",
    marginBottom: "clamp(20px, 4vw, 25px)",
    lineHeight: 1.6,
    fontFamily: theme.fonts.primary,
  };

  const userInfoBoxStyle: React.CSSProperties = {
    background: "rgba(217, 119, 6, 0.08)",
    borderRadius: "12px",
    padding: "clamp(15px, 3vw, 20px)",
    marginBottom: "clamp(20px, 4vw, 25px)",
    border: "1px solid rgba(217, 119, 6, 0.2)",
  };

  const userInfoItemStyle: React.CSSProperties = {
    fontSize: "clamp(0.9rem, 2vw, 1rem)",
    color: theme.colors.black,
    marginBottom: "8px",
    fontFamily: theme.fonts.primary,
  };

  const userInfoLabelStyle: React.CSSProperties = {
    fontWeight: 600,
    color: "#d97706",
  };

  const noteBoxStyle: React.CSSProperties = {
    background: "rgba(59, 130, 246, 0.08)",
    borderRadius: "10px",
    padding: "clamp(12px, 3vw, 15px)",
    marginBottom: "clamp(20px, 4vw, 25px)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  };

  const noteTextStyle: React.CSSProperties = {
    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
    color: "#1e40af",
    fontStyle: "italic",
    textAlign: "center",
    margin: 0,
    fontFamily: theme.fonts.primary,
  };

  const continueButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(12px, 3vw, 14px)",
    background: continueButtonHover ? "#16a34a" : "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    boxShadow: continueButtonHover ? "0 4px 12px rgba(22, 163, 74, 0.4)" : "0 2px 8px rgba(34, 197, 94, 0.3)",
    transform: continueButtonHover ? "translateY(-2px)" : "translateY(0)",
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

  /* ************************************************************ Render ************************************************************ */

  return (
    <>
      <div style={pageContainerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={logoStyle}>{logoText}</h1>
          <button style={connectButtonStyle} onClick={handleAlreadyAccount} onMouseEnter={() => setHeaderButtonHover(true)} onMouseLeave={() => setHeaderButtonHover(false)}>
            Se connecter
          </button>
        </header>

        {/* Main  */}
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

              {/* Confirmation Password */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>{confirmPasswordLabel}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={confirmPasswordPlaceholder}
                  style={inputStyle}
                  required
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

              {/* Déjà un compte ?*/}
              <span
                style={alreadyAccountLinkStyle}
                onClick={handleAlreadyAccount}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.color = "#b45309";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                  e.currentTarget.style.color = "#d97706";
                }}
              >
                {alreadyAccountText}
              </span>

              {/* Bouton envoyé */}
              <button
                type="submit"
                style={submitButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(217, 119, 6, 0.25)";
                  e.currentTarget.style.borderColor = "#d97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(217, 119, 6, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.3)";
                }}
              >
                {submitButtonText}
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer style={footerStyle}>
          <p style={copyrightStyle}>{copyrightText}</p>
        </footer>
      </div>

      {/* Popup de succès */}
      <div style={popupOverlayStyle}>
        <div style={popupContainerStyle}>
          <h2 style={popupTitleStyle}>👌 Compte créé avec succès !</h2>

          <p style={popupTextStyle}>Votre compte a été créé avec succès. Voici vos informations :</p>

          {userData && (
            <div style={userInfoBoxStyle}>
              <div style={userInfoItemStyle}>
                <span style={userInfoLabelStyle}>ID : </span>
                {userData.id}
              </div>
              <div style={userInfoItemStyle}>
                <span style={userInfoLabelStyle}>Email : </span>
                {userData.email}
              </div>
              <div style={userInfoItemStyle}>
                <span style={userInfoLabelStyle}>Créé le : </span>
                {new Date(userData.createdAt).toLocaleString("fr-FR")}
              </div>
            </div>
          )}

          <div style={noteBoxStyle}>
            <p style={noteTextStyle}>💡 Vous pourrez renseigner vos informations de profil (prénom, nom, login, photo) après votre première connexion.</p>
          </div>

          <button style={continueButtonStyle} onClick={handleContinueToLogin} onMouseEnter={() => setContinueButtonHover(true)} onMouseLeave={() => setContinueButtonHover(false)}>
            Se connecter maintenant
          </button>
        </div>
      </div>
    </>
  );
};

export default Register;
