import React from "react";

export interface AdBannerProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  onClick?: () => void;
  sponsoredLabel?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({
  title = "Northcrest",
  description = "Découvrez les dernières nouveautés.",
  imageUrl,
  buttonText = "Découvrir",
  onClick,
  sponsoredLabel = "SPONSORISÉ",
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 140,
        borderRadius: 12,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(20, 24, 32, 0.98), rgba(35, 42, 55, 0.98))",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
        display: "flex",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.32,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(8, 10, 14, 0.96) 0%, rgba(8, 10, 14, 0.78) 45%, rgba(8, 10, 14, 0.2) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "22px 24px",
          gap: 20,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: 7,
            }}
          >
            {sponsoredLabel}
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 6,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.4,
              color: "rgba(255, 255, 255, 0.68)",
              maxWidth: 500,
            }}
          >
            {description}
          </div>
        </div>

        {onClick && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              background: "#ffffff",
              color: "#111111",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-1px)";
              event.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.opacity = "1";
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdBanner;