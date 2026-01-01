import React from "react";

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    white: string;
    black: string;
  };
  gradients: {
    main: string;
  };
  fonts: {
    primary: string;
    italic: string;
  };
  logos?: {
    UploadIcon: React.FC<{ size?: number; color?: string }>;
  };
}

export const theme: Theme = {
  colors: {
    primary: "",
    secondary: "",
    text: "",
    textLight: "",
    white: "#ffffff",
    black: "#000000",
  },
  gradients: {
    main: "linear-gradient(180deg, #FFB88C 0%, #DE6262 100%)",
  },
  fonts: {
    primary: "Arial, sans-serif",
    italic: "italic",
  },
  logos: {
    UploadIcon: ({ size = 100, color = "white" }) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="34 42 32 23" width={size} height={size}>
        <path
          d="M 35 55
             C 35 52, 37 50, 40 50
             C 40 45, 44 42, 50 42
             C 56 42, 60 45, 60 50
             C 63 50, 65 52, 65 55
             C 65 58, 63 60, 60 60
             L 40 60
             C 37 60, 35 58, 35 55 Z"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="50" y1="65" x2="50" y2="48" />
          <polyline points="45,53 50,48 55,53" />
        </g>
      </svg>
    ),
  },
};

export default theme;
