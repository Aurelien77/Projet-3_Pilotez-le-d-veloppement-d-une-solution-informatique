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

  const userId = 8;

  /* ************************************************************ Effects ************************************************************ */

  useEffect(() => {
    fetchUserFiles();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [files, filter, searchQuery]);

  /* ************************************************************ Fonctions ************************************************************ */

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

    // Filtre par statut (Tous, Actifs, Expirés)
    if (filter === "active") {
      result = result.filter((file) => !file.isExpired);
    } else if (filter === "expired") {
      result = result.filter((file) => file.isExpired);
    }

    // Filtre par recherche
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
      const response = await fetch(
        `https://localhost:7120/api/Files/${fileId}?userId=${userId}`,

        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Retirer le fichier de la liste
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleCopyLink = (downloadLink: string) => {
    navigator.clipboard.writeText(downloadLink);
    alert("Lien copié dans le presse-papiers !");
  };

  const handleAccess = () => {
    // Rediriger vers la page de téléchargement

    /*     const downloadLink = `https://localhost:7120/api/Files/download/8`;
    window.open(downloadLink, "_blank"); */

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

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "mp4":
      case "avi":
      case "mov":
        return "🎬";
      case "mp3":
      case "wav":
        return "🎵";
      case "zip":
      case "rar":
        return "📦";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      default:
        return "📁";
    }
  };

  /* ************************************************************ Styles ************************************************************ */

  const pageContainer: React.CSSProperties = {
    minHeight: "100vh",
    background: theme.gradients.main,
    fontFamily: theme.fonts.primary,
  };

  const sidebar: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "240px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 900,
    color: theme.colors.black,
    marginBottom: "40px",
  };

  const menuItemStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#e2e8f0",
    color: theme.colors.black,
    cursor: "pointer",
    fontWeight: 600,
    marginBottom: "8px",
    transition: "all 0.3s ease",
  };

  const mainContent: React.CSSProperties = {
    marginLeft: "240px",
    padding: "20px 40px",
  };

  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: 700,
    color: theme.colors.black,
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
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

  const filterContainer: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  };

  const filterTabsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  };

  const filterTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "8px 20px",
    backgroundColor: isActive ? "#2d3748" : "#e2e8f0",
    color: isActive ? "white" : theme.colors.black,
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  });

  const searchInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: theme.fonts.primary,
  };

  const filesContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const fileCardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  };

  const fileInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
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
  };

  const fileMetaStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "#718096",
  };

  const fileActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "#fc8181",
    color: "white",
  };

  const copyButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "#4299e1",
    color: "white",
  };
  const copyrightStyle: React.CSSProperties = {
    fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
    color: theme.colors.black,
    opacity: 0.8,
    margin: 0,
    fontFamily: theme.fonts.primary,
  };
  const accessButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "#48bb78",
    color: "white",
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  };

  const statusBadgeStyle = (isExpired: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: isExpired ? "#fed7d7" : "#c6f6d5",
    color: isExpired ? "#c53030" : "#22543d",
    marginLeft: "8px",
  });

  const lockIconStyle: React.CSSProperties = {
    marginLeft: "8px",
  };

  /* ************************************************************ Rendu ************************************************************ */

  return (
    <div style={pageContainer}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <h1 style={logoStyle}>DataShare</h1>
        <div style={menuItemStyle}>Mes fichiers</div>
        <div style={{ marginTop: "auto" }}>
          <p style={copyrightStyle}>Copyright DataShare© 2025</p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={mainContent}>
        {/* En-tête */}
        <div style={header}>
          <h2 style={titleStyle}>Mes fichiers</h2>
          <div style={buttonGroupStyle}>
            <button style={buttonStyle} onClick={() => navigate("/")}>
              Ajouter des fichiers
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: "#e2e8f0", color: theme.colors.black }}
              onClick={() => {
                navigate("/");
              }}
            >
              🔓 Déconnexion
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && <div style={errorStyle}>{error}</div>}

        {/* Filtres */}
        <div style={filterContainer}>
          <div style={filterTabsStyle}>
            <button style={filterTabStyle(filter === "all")} onClick={() => setFilter("all")}>
              Tous
            </button>
            <button style={filterTabStyle(filter === "active")} onClick={() => setFilter("active")}>
              Actifs
            </button>
            <button style={filterTabStyle(filter === "expired")} onClick={() => setFilter("expired")}>
              Expiré
            </button>
          </div>
          <input type="text" placeholder="Rechercher un fichier..." style={searchInputStyle} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
            {filteredFiles.map((file) => (
              <div key={file.id} style={fileCardStyle}>
                <div style={fileInfoStyle}>
                  <span style={fileIconStyle}>{getFileIcon(file.fileName)}</span>
                  <div style={fileDetailsStyle}>
                    <div style={fileNameStyle}>
                      {file.fileName}
                      {file.hasPassword && <span style={lockIconStyle}>🔒</span>}
                      <span style={statusBadgeStyle(file.isExpired)}>{file.isExpired ? "Expiré" : "Actif"}</span>
                    </div>
                    <div style={fileMetaStyle}>
                      {formatDate(file.expirationDate)}
                      {file.isExpired && <span> • Ce fichier a expiré. Il n'est plus stocké chez nous</span>}
                    </div>
                  </div>
                </div>
                <div style={fileActionsStyle}>
                  {!file.isExpired && (
                    <>
                      <button style={copyButtonStyle} onClick={() => handleCopyLink(file.downloadLink)} title="Copier le lien">
                        📋
                      </button>
                      <button style={accessButtonStyle} onClick={() => handleAccess()} title="Accéder">
                        Accéder →
                      </button>
                    </>
                  )}
                  <button style={deleteButtonStyle} onClick={() => handleDelete(file.id)} title="Supprimer">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Usersfiles;
