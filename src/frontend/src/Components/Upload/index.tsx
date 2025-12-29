import React, { useState } from "react";
import theme from "../../Config/Themes/Index";
import { useAuth } from "../../Helpers/AuthContext";
/* ************************************************************ Typage ************************************************************ */

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number; // ID de l'utilisateur
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

  //Styles

  const [isHover, setIsHover] = useState(false);
  const [isHover2, setIsHover2] = useState(false);
  const [isHoverClose, setIsHoverClose] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [isActiveClose, setIsActiveClose] = useState(false);

  // Austate context

  const { authState } = useAuth();
  /* ************************************************************ Fonctions ************************************************************ */

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 2000 * 1024 * 1024; // MAx 2 GB
      if (file.size > maxSize) {
        setError("Le fichier est trop volumineux. Taille maximale : 2000 MB");
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

      // Si l'utilisateur est connecté, utiliser son ID, sinon ID 8 (invité)
      const userIdToSend = authState.id || 8;
      formData.append("IdUser", userIdToSend.toString());

      // Calculer la date de fin
      const endDate = calculateEndDate(expirationDays);
      formData.append("EndDate", endDate);

      // Ajouter le mot de passe si fourni
      if (password.trim()) {
        formData.append("FilePassword", password);
      }

      // Simulation de progression
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Envoi de la requête
      const response = await fetch("https://localhost:7120/api/Files/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Pour inclure les cookies JWT
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'upload");
      }

      const data: UploadResponse = await response.json();

      //Mettre le lien dans un state

      setDownloadLink(data.downloadLink);
      // Succès
      setSuccess(`Fichier uploadé avec succès ! Lien : ${data.downloadLink}`);
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
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
    width: "100vw",
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
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
  };

  const buttonStyleCopy: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    backgroundColor: isUploading ? "#a0aec0" : isActive ? "orange" : isHover ? "red" : "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: isUploading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    marginTop: "8px",
  };
  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    backgroundColor: isUploading ? "red" : isActive2 ? "orange" : isHover2 ? "blue" : "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: isUploading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    marginTop: "8px",
  };

  const closeButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: isUploading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    marginTop: "8px",

    backgroundColor: isActiveClose ? "orange" : isHoverClose ? "blue" : "#2d3748",
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

  const successStyle: React.CSSProperties = {
    backgroundColor: "#c6f6d5",
    color: "#22543d",
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

  const userStatusStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "#718096",
    marginBottom: "16px",
    textAlign: "center",
    fontStyle: "italic",
  };

  /* ************************************************************ Rendu ************************************************************ */

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Ajouter un fichier</h2>

        {/* Messages d'erreur | succès */}
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        {success && (
          <button type="button" style={closeButtonStyle} onClick={handleClose} onMouseEnter={() => setIsHoverClose(true)} onMouseLeave={() => setIsHoverClose(false)} onMouseDown={() => setIsActiveClose(true)} onMouseUp={() => setIsActiveClose(false)}>
            Fermer
          </button>
        )}

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
          {/* Copier le lien */}

          {downloadLink && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <input type="text" value={downloadLink} readOnly style={inputStyle} />

              <button type="button" onClick={() => navigator.clipboard.writeText(downloadLink)} style={buttonStyleCopy} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} onMouseDown={() => setIsActive(true)} onMouseUp={() => setIsActive(false)}>
                📋 Copier le lien
              </button>
            </div>
          )}
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

          {/* Boutons */}
          <button type="submit" style={buttonStyle} disabled={isUploading} onMouseEnter={() => setIsHover2(true)} onMouseLeave={() => setIsHover2(false)} onMouseDown={() => setIsActive2(true)} onMouseUp={() => setIsActive2(false)}>
            {isUploading ? "⏳ Téléversement en cours..." : " Téléverser"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
