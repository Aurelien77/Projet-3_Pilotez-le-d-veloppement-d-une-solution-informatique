
import React from 'react';
import theme from '../../Config/Themes';

/* ************************************************************ Typage ************************************************************ */

interface GardeProps {
  title?: string;
  subtitle?: string;
}

// React Fonctionnal Composnant  ( RFC ) 

const Garde: React.FC<GardeProps> = ({

//Possible Props déclarées ici en dur
  title = "DataShare",
  subtitle = "« Nous gardons vos fichiers en toute sécurité »",

}) => {

/* ************************************************************ CSS ************************************************************ */

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
     height: '100vh',
     background: theme.gradients.main,
  
    fontFamily: theme.fonts.primary
  };

  const textWrapperStyle: React.CSSProperties = {
    textAlign: 'center',
    animation: 'fadeIn 1s ease-in'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(3rem, 10vw, 7rem)',
    fontWeight: 700,
    color: theme.colors.black,
    fontFamily: theme.fonts.primary,

  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1.2rem, 3vw, 2rem)',
    fontWeight: 400,
    fontStyle: theme.fonts.italic,
    color: theme.colors.black,
   fontFamily: theme.fonts.primary,
  };

  return (
    <div style={containerStyle}>
      <div style={textWrapperStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <h2 style={subtitleStyle}>{subtitle}</h2>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Garde;