

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

    
  }

}

export const theme: Theme = {
  colors: {
    primary: "",
    secondary: "",
    text: "",
    textLight: "",
    white: "#ffffff",
    black: "#000000"
  },
  gradients: {
    main: "linear-gradient(180deg, #FFB88C 0%, #DE6262 100%)"
  },
  fonts: {
    primary: 'Arial, sans-serif',
    italic: 'italic'
  }
};





export default theme;