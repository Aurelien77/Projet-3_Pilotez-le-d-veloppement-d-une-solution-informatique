import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../Config/Themes/Index";
import { useAuth } from "../../Helpers/AuthContext";

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

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
}

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

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { authState } = useAuth();

  const userId = authState?.id;
  const [userData, setUserData] = useState<User>({
    id: userId,
    email: "",
    firstName: "Utilisateur",
    lastName: "",
    login: "",
  });

  /* ************************************************************ Effects ************************************************************ */

  useEffect(() => {
    fetchUserFiles();
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [files, filter, searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ************************************************************ Fonctions ************************************************************ */

  const fetchUserData = async () => {
    try {
      const response = await fetch(`https://localhost:7120/api/Users/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'utilisateur");
      }

      const data: User = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Erreur utilisateur:", err);
      // Données par défaut en cas d'erreur
      setUserData({
        id: userId,
        email: "",
        firstName: "Utilisateur",
        lastName: "",
        login: "",
      });
    }
  };

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

  const handleAccess = (fileId: number) => {
    navigate(`/download/${fileId}`);
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
    left: isMobile ? (isSidebarOpen ? 0 : "-100%") : 0,
    top: 0,
    bottom: 0,
    width: "220px",
    background: "linear-gradient(180deg, #FF9B73 0%, #FF7A57 50%, #FF6B4A 100%)",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    transition: "left 0.3s ease",
    zIndex: 2000,
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
    marginLeft: isMobile ? 0 : "255px",
    padding: isMobile ? "0px" : "0px 0px",
    transition: "margin-left 0.3s ease",
    overflowX: "hidden",
  };

  const header: React.CSSProperties = {
    display: "flex",
    padding: "16px 24px",
    justifyContent: isMobile ? "space-between" : "flex-end",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "rgba(216, 97, 28, 0.1)",
    borderBottom: "1px solid rgba(216, 97, 28, 0.29)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#2d3748",
    marginLeft: isMobile ? "3vw" : "1.5vw",
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
    fontSize: isMobile ? "0.65rem" : "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: theme.fonts.primary,
    whiteSpace: "nowrap",
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
    marginLeft: isMobile ? "15px" : "1.5vw",
    marginRight: isMobile ? "15px" : "0",
  };

  const filterTabsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0px",
    marginBottom: "16px",
    padding: "0px",
    borderRadius: "50px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    width: isMobile ? "100%" : "fit-content",
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
    flex: isMobile ? "1" : "initial",
  });

  const filterTabStyleActif = (isActive: boolean): React.CSSProperties => ({
    ...filterTabStyle(isActive),
    borderRadius: "10px 10px 10px 10px",
  });

  const filterTabStyleExpire = (isActive: boolean): React.CSSProperties => ({
    ...filterTabStyle(isActive),
    borderRadius: "10px 50px 50px 10px",
  });

  const filesContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  };

  const fileCardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 193, 145, 0.05)",
    borderRadius: isMobile ? "12px" : "16px",
    padding: isMobile ? "16px" : "20px 24px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: isMobile ? "80px" : "auto",
    maxHeight: isMobile ? "none" : "2vw",
    transition: "all 0.3s ease",
    cursor: hover ? "pointer" : "none",
    border: "1px solid rgba(215, 99, 11, 0.2)",
    marginLeft: isMobile ? "15px" : "1.5vw",
    marginRight: isMobile ? "15px" : "1.5vw",
    marginBottom: isMobile ? "12px" : "0",
  };

  const fileInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flex: 1,
    minWidth: isMobile ? "0" : "auto",
  };

  const fileIconContainerStyle: React.CSSProperties = {
    width: isMobile ? "48px" : "52px",
    height: isMobile ? "48px" : "52px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "1.5rem" : "1.6rem",
  };

  const fileDetailsStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const fileNameContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "6px" : "10px",
    marginBottom: isMobile ? "4px" : "6px",
    flexWrap: "nowrap",
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: isMobile ? "0.95rem" : "1.05rem",
    fontWeight: 600,
    color: "#2d3748",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: isMobile ? "200px" : "300px",
  };

  const fileMetaStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
    fontSize: isMobile ? "0.85rem" : "0.9rem",
    color: "#718096",
    marginTop: isMobile ? "4px" : "0",
  };

  const fileActionsStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    width: isMobile ? "auto" : "auto",
    gap: "10px",
    justifyContent: isMobile ? "space-between" : "flex-start",
    alignItems: "center",
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: isMobile ? "8px 12px" : "10px 18px",
    border: "none",
    borderRadius: "8px",
    fontSize: isMobile ? "0.8rem" : "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: isMobile ? "1" : "initial",
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

  const lockIconStyle: React.CSSProperties = {
    fontSize: "1rem",
  };

  //Pour mobile

  const overlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: isMobile && isSidebarOpen ? "block" : "none",
    zIndex: 1999,
  };

  const mobileHeader: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  };

  const menuButton: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
    color: "#2d3748",
  };

  const userInfo: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const userPhoto: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  };

  const userName: React.CSSProperties = {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#2d3748",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const menuDotsButton: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#FF9B73",
    cursor: "pointer",
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  };
  const defaultAvatar = `data:image/svg+xml,${encodeURIComponent(`
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="60" fill="#D9D9D9"/>
  <circle cx="60" cy="45" r="25" fill="#FFFFFF"/>
  <path d="M35 95 C35 75, 85 75, 85 95 Z" fill="#FFFFFF"/>
  <ellipse cx="60" cy="95" rx="25" ry="5" fill="#C0C0C0"/>
</svg>
`)}`;

  /* ************************************************************ Rendu ************************************************************ */

  return (
    <div style={pageContainer}>
      {/* Sidebar */}
      <div style={overlay} onClick={() => setIsSidebarOpen(false)} />
      <aside style={sidebar}>
        {isMobile && (
          <button style={closeButtonStyle} onClick={() => setIsSidebarOpen(false)}>
            ✕
          </button>
        )}
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
          {isMobile && userData && (
            <div style={mobileHeader}>
              <button style={menuButton} onClick={() => setIsSidebarOpen(true)}>
                ☰
              </button>
              <div style={userInfo}>
                <img src={defaultAvatar} alt="User" style={userPhoto} />
                <span style={userName}>
                  {userData.firstName} {userData.lastName}
                </span>
              </div>
            </div>
          )}
          <div style={buttonGroupStyle}>
            {!isMobile && (
              <button style={addButtonStyle} onClick={() => navigate("/")}>
                Ajouter des fichiers
              </button>
            )}
            {!isMobile && (
              <button style={logoutButtonStyle} onClick={() => navigate("/")}>
                🔓 Déconnexion
              </button>
            )}
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
              const { icon } = getFileIcon(file.fileName);
              return (
                <div key={file.id} style={fileCardStyle} onClick={() => handleCopyLink(file.downloadLink, file.isExpired)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                  <div style={fileInfoStyle}>
                    <div style={fileIconContainerStyle}>{icon}</div>
                    <div style={fileDetailsStyle}>
                      <div style={fileNameContainerStyle}>
                        <span style={fileNameStyle}>{file.fileName}</span>
                      </div>

                      <div style={fileMetaStyle}>
                        {file.isExpired ? (
                          <>
                            <span style={{ color: "#e53e3e", fontWeight: 600 }}>Expiré</span>
                            {!isMobile && <span>Ce fichier a expiré. Il n'est plus stocké chez nous </span>}
                          </>
                        ) : (
                          formatDate(file.expirationDate)
                        )}
                      </div>
                    </div>
                  </div>
                  {file.hasPassword && !file.isExpired && <span style={lockIconStyle}>🔒</span>}

                  {!file.isExpired && !isMobile && (
                    <button
                      style={deleteButtonStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      title="Supprimer"
                    >
                      🗑️ Supprimer
                    </button>
                  )}

                  <div style={fileActionsStyle}>
                    {!file.isExpired && !isMobile && (
                      <button
                        style={accessButtonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccess(file.id);
                        }}
                        title="Accéder"
                      >
                        Accéder →
                      </button>
                    )}

                    {!file.isExpired && isMobile && (
                      <button
                        style={menuDotsButton}
                        onClick={(e) => {
                          e.stopPropagation(); /* Ouvrir menu */
                        }}
                      >
                        ⋮
                      </button>
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
