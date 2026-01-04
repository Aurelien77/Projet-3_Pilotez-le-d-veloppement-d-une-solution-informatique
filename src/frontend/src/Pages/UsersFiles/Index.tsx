import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../Config/Themes/Index";

/* ************************************************************ Typage ************************************************************ */

interface FileItem {
  id: number;
  fileName: string;
  creationDate: string;
  expirationDate: string;
  isExpired: boolean;
  hasPassword: boolean;
  downloadLink: string;
}

type FilterType = "all" | "active" | "expired";

/* ************************************************************ Composant ************************************************************ */

const Usersfiles: React.FC = () => {
  /* ************************************************************ States ************************************************************ */

  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoverLogo, setHoverLogo] = useState(false);
  const userId = 8;

  /* ************************************************************ Effects ************************************************************ */

  useEffect(() => {
    fetchUserFiles();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [files, filter, searchQuery]);

  /* ************************************************************ Fonctions ************************************************************ */
  const HandleHome = () => {
    navigate("/");
  };

  const fetchUserFiles = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`https://localhost:7120/api/Files/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des fichiers");
      }

      const data: FileItem[] = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...files];

    if (filter === "active") {
      result = result.filter((file) => !file.isExpired);
    } else if (filter === "expired") {
      result = result.filter((file) => file.isExpired);
    }

    if (searchQuery.trim()) {
      result = result.filter((file) => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredFiles(result);
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7120/api/Files/${fileId}?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleCopyLink = (downloadLink: string, isExpired: boolean) => {
    if (isExpired) {
      alert("Ce lien a expiré, il ne peut plus être copié.");
      return;
    }

    navigator.clipboard.writeText(downloadLink);
    alert("Lien copié dans le presse-papiers !");
  };

  const handleAccess = () => {
    navigate(`/download/8`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Expiré";
    } else if (diffDays === 0) {
      return "Expire aujourd'hui";
    } else if (diffDays === 1) {
      return "Expire demain";
    } else if (diffDays <= 7) {
      return `Expire dans ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  };

  const getFileIcon = (fileName: string): { icon: string; bgColor: string } => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return { icon: "📄", bgColor: "#FED7D7" };
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return { icon: "🖼️", bgColor: "#C6F6D5" };
      case "mp4":
      case "avi":
      case "mov":
        return { icon: "🎬", bgColor: "#DDD6FE" };
      case "mp3":
      case "wav":
        return { icon: "🎵", bgColor: "#BFDBFE" };
      case "zip":
      case "rar":
        return { icon: "📦", bgColor: "#FED7AA" };
      case "doc":
      case "docx":
        return { icon: "📝", bgColor: "#FECACA" };
      case "xls":
      case "xlsx":
        return { icon: "📊", bgColor: "#BAE6FD" };
      default:
        return { icon: "📁", bgColor: "#E5E7EB" };
    }
  };

  /* ************************************************************ Styles ************************************************************ */

  const pageContainer: React.CSSProperties = {
    minHeight: "100vh",

    fontFamily: theme.fonts.primary,
  };

  const sidebar: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "220px",
    background: "linear-gradient(180deg, #FF9B73 0%, #FF7A57 50%, #FF6B4A 100%)",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  };

  const [hover, setHover] = React.useState(false);

  const logoStyle: React.CSSProperties = {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "white",
    marginBottom: "40px",
    cursor: hover ? "pointer" : "default",
  };

  const menuItemStyle: React.CSSProperties = {
    padding: "14px 18px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    marginBottom: "8px",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  };

  const mainContent: React.CSSProperties = {
    marginLeft: "220px",
    padding: "30px 50px",
  };

  const header: React.CSSProperties = {
    display: "flex",
    padding: "clamp(10px, 2vw, 16px) clamp(12px, 4vw, 24px)",
    justifyContent: "right",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "rgba(216, 97, 28, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#2d3748",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
  };

  const addButtonStyle: React.CSSProperties = {
    padding: "12px 24px",
    backgroundColor: "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
  };

  const logoutButtonStyle: React.CSSProperties = {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#FF812D",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 300,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
  };

  const filterContainer: React.CSSProperties = {
    backgroundColor: "transparent",
    marginBottom: "24px",
  };

  const filterTabsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0px",
    marginBottom: "16px",

    padding: "0px",
    borderRadius: "50px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    width: "fit-content",
  };

  const filterTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "10px 28px",
    backgroundColor: isActive ? "#E77A6E" : "rgba(255, 165, 105, 0.05)",
    color: isActive ? "white" : "#2d3748",
    border: "none",
    borderRadius: "50px 10px 10px 50px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    whiteSpace: "nowrap",
  });

  const filterTabStyleActif = (isActive: boolean): React.CSSProperties => ({
    ...filterTabStyle(isActive),
    borderRadius: "10px 10px 10px 10px",
  });

  const filterTabStyleExpire = (isActive: boolean): React.CSSProperties => ({
    ...filterTabStyle(isActive),
    borderRadius: "10px 50px 50px 10px",
  });

  const searchInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #E0E0E0",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: theme.fonts.primary,
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const filesContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  };

  const fileCardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 193, 145, 0.05)",
    borderRadius: "16px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    cursor: hover ? "pointer" : "none",
  };

  const fileInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flex: 1,
  };

  const fileIconContainerStyle = (bgColor: string): React.CSSProperties => ({
    width: "52px",
    height: "52px",
    borderRadius: "10px",
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.6rem",
  });

  const fileDetailsStyle: React.CSSProperties = {
    flex: 1,
  };

  const fileNameContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "6px",
    flexWrap: "wrap",
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#2d3748",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "300px",
  };

  const fileMetaStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "#718096",
  };

  const fileActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "rgba(255, 165, 105, 0.03)",
    marginRight: "10px",
    color: "#f1ad1aff",
    border: "1px solid #FFA0A0",
  };

  const accessButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "rgba(255, 165, 105, 0.03)",
    color: "#f1ad1aff",
    border: "1px solid #FFA0A0",
  };

  const copyrightStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    fontFamily: theme.fonts.primary,
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "1.2rem",
    color: "#718096",
  };

  const FolderStyle: React.CSSProperties = {
    fontSize: "3rem",
    marginBottom: "16px",
  };

  const FolderStyleText: React.CSSProperties = {
    fontSize: "1.5rem",
    marginBottom: "16px",
    color: "#2d3748",
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
  };

  const statusBadgeStyle = (isExpired: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 600,
    backgroundColor: isExpired ? "#FFEBEE" : "#E8F5E9",
    color: isExpired ? "#D32F2F" : "#388E3C",
    border: `1px solid ${isExpired ? "#FFCDD2" : "#C8E6C9"}`,
  });

  const lockIconStyle: React.CSSProperties = {
    fontSize: "1rem",
  };

  /* ************************************************************ Rendu ************************************************************ */

  return (
    <div style={pageContainer}>
      {/* Sidebar */}

      <aside style={sidebar}>
        <h1 style={logoStyle} onClick={HandleHome} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          DataShare
        </h1>
        <div style={menuItemStyle}>Mes fichiers</div>
        <div style={{ marginTop: "auto" }}>
          <p style={copyrightStyle}>Copyright DataShare© 2025</p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={mainContent}>
        {/* En-tête */}
        <div style={header}>
          <div style={buttonGroupStyle}>
            <button style={addButtonStyle} onClick={() => navigate("/")}>
              Ajouter des fichiers
            </button>
            <button style={logoutButtonStyle} onClick={() => navigate("/")}>
              🔓 Déconnexion
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && <div style={errorStyle}>{error}</div>}
        <h2 style={titleStyle}>Mes fichiers</h2>
        {/* Filtres */}
        <div style={filterContainer}>
          <div style={filterTabsStyle}>
            <button style={filterTabStyle(filter === "all")} onClick={() => setFilter("all")}>
              Tous
            </button>
            <button style={filterTabStyleActif(filter === "active")} onClick={() => setFilter("active")}>
              Actifs
            </button>
            <button style={filterTabStyleExpire(filter === "expired")} onClick={() => setFilter("expired")}>
              Expiré
            </button>
          </div>
        </div>

        {/* Liste des fichiers */}
        {isLoading ? (
          <div style={loadingStyle}>Chargement des fichiers...</div>
        ) : filteredFiles.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={FolderStyle}>📁</div>
            <h3 style={FolderStyleText}>Aucun fichier trouvé</h3>
            <p style={{ color: "#718096" }}>{files.length === 0 ? "Vous n'avez pas encore partagé de fichiers" : "Aucun fichier ne correspond à vos critères de recherche"}</p>
          </div>
        ) : (
          <div style={filesContainer}>
            {filteredFiles.map((file) => {
              const { icon, bgColor } = getFileIcon(file.fileName);
              return (
                <div key={file.id} style={fileCardStyle} onClick={() => handleCopyLink(file.downloadLink, file.isExpired)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                  <div style={fileInfoStyle}>
                    <div style={fileIconContainerStyle(bgColor)}>{icon}</div>
                    <div style={fileDetailsStyle}>
                      <div style={fileNameContainerStyle}>
                        <span style={fileNameStyle}>{file.fileName}</span>

                        {/*             <span style={statusBadgeStyle(file.isExpired)}>{file.isExpired ? "Expiré" : "Actif"}</span> */}
                      </div>
                      <div style={fileMetaStyle}>{file.isExpired ? "Expiré • Ce fichier à expiré. Il n'est plus stocké chez nous" : formatDate(file.expirationDate)}</div>
                    </div>
                  </div>
                  {file.hasPassword && <span style={lockIconStyle}>🔒</span>}
                  <button style={deleteButtonStyle} onClick={() => handleDelete(file.id)} title="Supprimer">
                    🗑️ Supprimer
                  </button>
                  <div style={fileActionsStyle}>
                    {!file.isExpired && (
                      <>
                        <button style={accessButtonStyle} onClick={() => handleAccess()} title="Accéder">
                          Accéder →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Usersfiles;
