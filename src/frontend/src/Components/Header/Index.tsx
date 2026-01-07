import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Helpers/AuthContext";

interface HeaderProps {
  logoText?: string;
  submitButtonText?: string;
  onButtonClick?: () => void;
  logoColor?: string;
  logoFontSize?: string;
  buttonColor?: string;
  buttonBackground?: string;
  buttonText?: string;
  logoStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  hover?: boolean;
  setHover?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ logoText = "DataShare", logoStyle, buttonStyle }) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();

  const [hoverLogo, setHoverLogo] = useState(false);
  const label = authState.status ? "Déconnexion" : "Connexion";
  const handleHome = () => {
    if (authState.status) {
      logout();
      navigate("/");
    } else {
      navigate("/Connexion");
    }
  };

  const handleButtonClick = () => {
    navigate("/");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1
        data-testid="header-logo"
        style={{
          ...logoStyle,
          cursor: hoverLogo ? "pointer" : "default",
          transition: "all 0.2s",
          margin: 0,
          marginLeft: "clamp(2vw, 7vw, 4vw)",
        }}
        onClick={handleButtonClick}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        {logoText}
      </h1>
      <button
        data-testid="header-login-button"
        style={{
          ...buttonStyle,
          marginRight: "clamp(2vw, 6vw, 4vw)",
        }}
        onClick={handleHome}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        {label}
      </button>
    </header>
  );
};

export default Header;
