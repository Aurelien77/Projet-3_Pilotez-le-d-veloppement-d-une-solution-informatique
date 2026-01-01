// Components/Footer/Index.tsx
import React from "react";

interface FooterProps {
  copyrightText?: string;
  containerStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}

const Footer: React.FC<FooterProps> = ({ copyrightText = "© MonSite 2026", containerStyle, textStyle }) => {
  const defaultContainerStyle: React.CSSProperties = {
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)",
    flexShrink: 0,
  };

  const defaultTextStyle: React.CSSProperties = {
    fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
    color: "#000",
    opacity: 0.8,
    margin: 0,
    fontFamily: "Arial, sans-serif",
  };

  return (
    <footer style={{ ...defaultContainerStyle, ...containerStyle }}>
      <p style={{ ...defaultTextStyle, ...textStyle }}>Copyright DataShare© 2025</p>
    </footer>
  );
};

export default Footer;
