import React, { useState } from "react";
import theme from "../../Config/Themes/Index";
import { useAuth } from "../../Helpers/AuthContext";

/* ************************************************************ Typage ************************************************************ */

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

interface UploadResponse {
  message: string;
  fileId: number;
  fileName: string;
  downloadLink: string;
  expirationDate: string;
}

interface ErrorResponse {
  message: string;
}

/* ************************************************************ Composant ************************************************************ */

const FileUpload: React.FC<FileUploadProps> = ({ isOpen, onClose, userId }) => {
  /* ************************************************************ States ************************************************************ */

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [expirationDays, setExpirationDays] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(0);

  // Styles hover states
  const [isHover, setIsHover] = useState(false);
  const [isHover2, setIsHover2] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);

  const { authState } = useAuth();

  /* ************************************************************ Fonctions ************************************************************ */

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 1024 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("La taille des fichiers est limitée à 1 Go");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");
  };

  const calculateEndDate = (days: number): string => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return endDate.toISOString();
  };

  const getExpirationText = (days: number): string => {
    if (days === 1) return "une journée";
    if (days === 3) return "3 jours";
    if (days === 7) return "une semaine";
    if (days === 14) return "2 semaines";
    if (days === 30) return "un mois";
    return `${days} jours`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("File", selectedFile);

      const userIdToSend = authState.id || 8;
      formData.append("IdUser", userIdToSend.toString());

      const endDate = calculateEndDate(expirationDays);
      formData.append("EndDate", endDate);

      if (password.trim()) {
        formData.append("FilePassword", password);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("https://localhost:7120/api/Files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload");
      }

      const data: UploadResponse = await response.json();

      setDownloadLink(data.downloadLink);
      setUploadedFileName(selectedFile.name);
      setUploadedFileSize(selectedFile.size);
      setSuccess("Fichier uploadé avec succès !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPassword("");
    setExpirationDays(1);
    setError("");
    setSuccess("");
    setUploadProgress(0);
    setDownloadLink(null);
    setUploadedFileName("");
    setUploadedFileSize(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Octets";
    const k = 1024;
    const sizes = ["Octets", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  /* ************************************************************ Styles ************************************************************ */

  const overlayStyle: React.CSSProperties = {
    display: isOpen ? "flex" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    fontFamily: theme.fonts.primary,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "24px",
    color: theme.colors.black,
    textAlign: "center",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.95rem",
    fontWeight: 500,
    color: theme.colors.black,
  };

  const fileInputContainerStyle: React.CSSProperties = {
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: selectedFile ? "#f7fafc" : "#ffffff",
  };

  const fileInputStyle: React.CSSProperties = {
    display: "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: theme.fonts.primary,
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: theme.fonts.primary,
    transition: "border-color 0.3s ease",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "auto",
    minHeight: "48px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "1px solid #CD5E1480",
    backgroundColor: isUploading ? "#cbd5e0" : isActive2 ? "orange" : isHover2 ? "#f7ab79ff" : "#FF812D21",
    color: isHover2 ? "#faf5f2ff" : "#CD5E1480",
  };

  const copyButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: isActive ? "#e67e22" : isHover ? "#f39c12" : "#FF812D",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    marginTop: "16px",
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

  const fileInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#edf2f7",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "8px",
  };

  const removeButtonStyle: React.CSSProperties = {
    backgroundColor: "#fc8181",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "12px",
  };

  const progressBarStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: "#48bb78",
    width: `${uploadProgress}%`,
    transition: "width 0.3s ease",
  };

  const successContainerStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "20px 0",
  };

  const fileIconContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f7fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
  };

  const congratsTextStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#2d3748",
    marginBottom: "20px",
    lineHeight: "1.5",
  };

  const linkContainerStyle: React.CSSProperties = {
    backgroundColor: "#f7fafc",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    wordBreak: "break-all",
  };

  const linkStyle: React.CSSProperties = {
    color: "#FF812D",
    textDecoration: "underline",
    fontSize: "0.95rem",
  };

  /* ************************************************************ Rendu ************************************************************ */

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Ajouter un fichier</h2>

        {/* Vue de succès */}
        {success && downloadLink ? (
          <div style={successContainerStyle}>
            {/* Info du fichier avec icône */}
            <div style={fileIconContainerStyle}>
              <div style={{ fontSize: "2rem" }}>🖼️</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{uploadedFileName}</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>{formatFileSize(uploadedFileSize)}</div>
              </div>
            </div>

            {/* Message de félicitations */}
            <div style={congratsTextStyle}>Félicitations, ton fichier sera conservé chez nous pendant {getExpirationText(expirationDays)} !</div>

            {/* Lien de téléchargement */}
            <div style={linkContainerStyle}>
              <a href={downloadLink} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {downloadLink}
              </a>
            </div>

            {/* Bouton copier */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(downloadLink);
              }}
              style={copyButtonStyle}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              onMouseDown={() => setIsActive(true)}
              onMouseUp={() => setIsActive(false)}
            >
              📋 Copier le lien
            </button>
          </div>
        ) : (
          <>
            {/* Messages d'erreur */}
            {error && <div style={errorStyle}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Sélection du fichier */}
              <div style={formGroupStyle}>
                <input type="file" id="fileInput" style={fileInputStyle} onChange={handleFileChange} disabled={isUploading} />
                <label htmlFor="fileInput" style={fileInputContainerStyle}>
                  {selectedFile ? (
                    <div style={fileInfoStyle}>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>{selectedFile.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "#718096" }}>{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        style={removeButtonStyle}
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFile();
                        }}
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📁</div>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>Cliquez pour sélectionner un fichier</div>
                    </>
                  )}
                </label>
              </div>

              {/* Mot de passe */}
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="password">
                  Mot de passe
                </label>
                <input type="password" id="password" style={inputStyle} placeholder="Optionnel" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isUploading} />
              </div>

              {/* Durée d'expiration */}
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="expiration">
                  Expiration *
                </label>
                <select id="expiration" style={selectStyle} value={expirationDays} onChange={(e) => setExpirationDays(Number(e.target.value))} disabled={isUploading}>
                  <option value={1}>Une journée</option>
                  <option value={3}>3 jours</option>
                  <option value={7}>Une semaine</option>
                  <option value={14}>2 semaines</option>
                  <option value={30}>Un mois</option>
                </select>
              </div>

              {/* Barre de progression */}
              {isUploading && (
                <div style={progressBarContainerStyle}>
                  <div style={progressBarStyle}></div>
                </div>
              )}

              {/* Bouton téléverser */}
              <button type="submit" style={buttonStyle} disabled={isUploading} onMouseEnter={() => setIsHover2(true)} onMouseLeave={() => setIsHover2(false)} onMouseDown={() => setIsActive2(true)} onMouseUp={() => setIsActive2(false)}>
                {theme.logos?.UploadIcon && <theme.logos.UploadIcon size={20} color={isHover2 ? "#faf5f2ff" : "#CD5E1480"} />}
                {isUploading ? "⏳ Téléversement en cours..." : "Téléverser"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
