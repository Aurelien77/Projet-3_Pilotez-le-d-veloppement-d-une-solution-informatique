import React, { useState } from "react";
import theme from "../../Config/Themes/Index";
import { useNavigate } from "react-router-dom";

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

const Header: React.FC<HeaderProps> = ({ logoText = "DataShare", buttonText = "Se connecter", onButtonClick, logoStyle, buttonStyle }) => {
  const navigate = useNavigate();
  const [hoverLogo, setHoverLogo] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  const handleHome = () => navigate("/");

  onButtonClick = () => {
    navigate("/Connexion");
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)" }}>
      <h1
        style={{
          ...logoStyle,
          cursor: hoverLogo ? "pointer" : "default",
          transition: "all 0.2s",
        }}
        onClick={handleHome}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        {logoText}
      </h1>
      <button style={buttonStyle} onClick={onButtonClick} onMouseEnter={() => setHoverButton(true)} onMouseLeave={() => setHoverButton(false)}>
        {buttonText}
      </button>
    </header>
  );
};

export default Header;
