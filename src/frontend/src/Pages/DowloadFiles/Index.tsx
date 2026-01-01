import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import theme from "../../Config/Themes/Index";
import Header from "../../Components/Header/Index";
import Footer from "../../Components/Footer/Index";

/* ************************************************************ Typage ************************************************************ */

interface FileInfo {
  id: number;
  fileName: string;
  hasPassword: boolean;
  creationDate: string;
  expirationDate: string;
  isExpired: boolean;

  uploadedBy: {
    id: number;
    email: string;
  };
}

/* ************************************************************ Composant ************************************************************ */

const DownloadFiles: React.FC = () => {
  /* ************************************************************ States ************************************************************ */

  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [headerButtonHover, setHeaderButtonHover] = useState(false);
  /* ************************************************************ Use Effects ************************************************************ */

  useEffect(() => {
    if (fileId) {
      fetchFileInfo();
    }
  }, [fileId]);

  /* ************************************************************ Fonctions ************************************************************ */

  const fetchFileInfo = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`https://localhost:7120/api/Files/${fileId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Fichier introuvable");
      }

      const data: FileInfo = await response.json();
      setFileInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fileInfo) return;

    try {
      setIsDownloading(true);
      setError("");

      const response = await fetch(`https://localhost:7120/api/Files/download/${fileId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: fileInfo.hasPassword ? password : null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (fileName: string): string => {
    // Cette fonction est pour l'exemple, vous pouvez la supprimer si non nécessaire
    return "2,6 Mo"; // Placeholder
  };

  const calculateDaysRemaining = (expirationDate: string): number => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /* ************************************************************ Styles ************************************************************ */

  const pageContainer: React.CSSProperties = {
    minHeight: "100vh",
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

  const connectButtonStyle: React.CSSProperties = {
    padding: "clamp(8px, 2vw, 12px) clamp(16px, 4vw, 28px)",
    background: "#2d3748",
    color: theme.colors.white,
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontFamily: theme.fonts.primary,
    border: "none",
  };

  const mainContent: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.colors.black,
    marginBottom: "24px",
    textAlign: "center",
  };

  const fileInfoContainer: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  };

  const fileIconStyle: React.CSSProperties = {
    fontSize: "2rem",
  };

  const fileDetailsStyle: React.CSSProperties = {
    flex: 1,
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.colors.black,
    marginBottom: "4px",
    wordBreak: "break-word",
  };

  const fileSizeStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "#718096",
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: "#e6f2ff",
    border: "1px solid #b3d9ff",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  };

  const infoIconStyle: React.CSSProperties = {
    color: "#2b6cb0",
    fontSize: "1.2rem",
  };

  const infoTextStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "#2c5282",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: theme.colors.black,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: theme.fonts.primary,
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    backgroundColor: isDownloading ? "#a0aec0" : "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: isDownloading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "0.9rem",
    textAlign: "center",
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "1.2rem",
    color: "#718096",
  };

  const expiredContainerStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "40px 20px",
  };

  const expiredIconStyle: React.CSSProperties = {
    fontSize: "4rem",
    marginBottom: "16px",
  };

  const expiredTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#c53030",
    marginBottom: "8px",
  };

  const expiredTextStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#718096",
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
    <div style={pageContainer}>
      <Header logoStyle={logoStyle} buttonStyle={ButtonStyle} />

      {/* Contenu principal */}
      <main style={mainContent}>
        <div style={cardStyle}>
          {isLoading ? (
            <div style={loadingStyle}>Chargement du fichier...</div>
          ) : !fileInfo ? (
            <>
              <div style={expiredContainerStyle}>
                <div style={expiredIconStyle}></div>
                <h2 style={expiredTitleStyle}>❗ Ce fichier n'est plus disponible en téléchargement </h2>
                <p style={expiredTextStyle}>Car il a expiré.</p>
              </div>
              <button style={buttonStyle} onClick={() => navigate("/")}>
                Retour à l'accueil
              </button>
            </>
          ) : fileInfo.isExpired ? (
            <div style={expiredContainerStyle}>
              <div style={expiredIconStyle}></div>
              <h2 style={expiredTitleStyle}>❗ Ce fichier n'est plus disponible en téléchargement </h2>
              <p style={expiredTextStyle}>Car il a expiré.</p>
            </div>
          ) : (
            <>
              <h2 style={titleStyle}>Télécharger un fichier</h2>

              {/* Informations du fichier */}
              <div style={fileInfoContainer}>
                <span style={fileIconStyle}>📄</span>
                <div style={fileDetailsStyle}>
                  <div style={fileNameStyle}>{fileInfo.fileName}</div>
                  <div style={fileSizeStyle}>{formatFileSize(fileInfo.fileName)}</div>
                </div>
              </div>

              {/* Info expiration */}
              <div style={infoBoxStyle}>
                <span style={infoIconStyle}>ℹ️</span>
                <span style={infoTextStyle}>Ce fichier expirera dans {calculateDaysRemaining(fileInfo.expirationDate)} jours.</span>
              </div>

              {/* Message d'erreur */}
              {error && <div style={errorStyle}>{error}</div>}

              {/* Mot de passe si nécessaire */}
              {fileInfo.hasPassword && (
                <form onSubmit={handleDownload}>
                  <label style={labelStyle} htmlFor="password">
                    Mot de passe
                  </label>
                  <input type="password" id="password" placeholder="Saisissez le mot de passe..." style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isDownloading} required />
                </form>
              )}

              {/* Bouton de téléchargement */}
              <button style={buttonStyle} onClick={handleDownload} disabled={isDownloading || (fileInfo.hasPassword && !password)}>
                <span>📥</span>
                <span>{isDownloading ? "Téléchargement..." : "Télécharger"}</span>
              </button>
            </>
          )}
        </div>
      </main>

      <Footer containerStyle={footerStyle} textStyle={copyrightStyle} />
    </div>
  );
};

export default DownloadFiles;
