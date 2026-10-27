
"use client";

import { useEffect, useState } from "react";

export default function ProductImageGallery({
  images = [],
  productName = "Product",
}) {
  const imageList = images
    .map((image) =>
      typeof image === "string" ? image : image?.url
    )
    .filter(Boolean);

  const [selectedImage, setSelectedImage] = useState(
    imageList[0] || ""
  );
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(imageList[0] || "");
    setPopupOpen(false);
  }, [images]);

  useEffect(() => {
    if (!popupOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPopupOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [popupOpen]);

  const currentIndex = imageList.indexOf(selectedImage);

  const changeImage = (direction) => {
    if (imageList.length < 2) return;

    const nextIndex =
      (currentIndex + direction + imageList.length) %
      imageList.length;

    setSelectedImage(imageList[nextIndex]);
  };

  return (
    <>
      {/* Main Product Image */}
      <div
        className="dazro-details-main-image"
        style={{
          cursor: selectedImage ? "zoom-in" : "default",
          position: "relative",
        }}
        onClick={() => {
          if (selectedImage) setPopupOpen(true);
        }}
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={productName}
            decoding="async"
          />
        ) : (
          <span>No Image</span>
        )}
      </div>

      {/* Small Thumbnail Images */}
      {imageList.length > 1 && (
        <div className="d-flex gap-2 mt-3 flex-wrap">
          {imageList.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              onClick={() => setSelectedImage(image)}
              className={`dazro-details-thumb ${
                selectedImage === image ? "active" : ""
              }`}
              style={{
                border:
                  selectedImage === image
                    ? "2px solid #D21165"
                    : "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
              }}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={selectedImage === image}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Image Popup */}
      {popupOpen && selectedImage && (
        <div
          role="presentation"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            zIndex: 99999,
            padding: "15px",
          }}
          onClick={() => setPopupOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image gallery`}
            className="position-relative bg-white rounded-4 p-3"
            style={{
              width: "100%",
              maxWidth: "800px",
              maxHeight: "95vh",
              overflowY: "auto",
              boxShadow: "0 10px 50px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPopupOpen(false)}
              className="btn-close position-absolute"
              aria-label="Close image popup"
              style={{
                top: "18px",
                right: "18px",
                zIndex: 10,
              }}
            />

            {/* Product Name */}
            <h5
              className="fw-semibold mb-3 pe-5"
              style={{ color: "#333" }}
            >
              {productName}
            </h5>

            {/* Large Popup Image */}
            <div
              className="position-relative d-flex align-items-center justify-content-center"
              style={{
                height: "420px",
                maxHeight: "55vh",
                background: "#FFF2F8",
                borderRadius: "12px",
              }}
            >
              <img
                src={selectedImage}
                alt={productName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "15px",
                }}
              />

              {/* Previous Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() => changeImage(-1)}
                  aria-label="Previous image"
                  className="position-absolute"
                  style={{
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "38px",
                    height: "38px",
                    border: "none",
                    borderRadius: "50%",
                    background: "#fff",
                    color: "#D21165",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #0002",
                  }}
                >
                  ‹
                </button>
              )}

              {/* Next Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() => changeImage(1)}
                  aria-label="Next image"
                  className="position-absolute"
                  style={{
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "38px",
                    height: "38px",
                    border: "none",
                    borderRadius: "50%",
                    background: "#fff",
                    color: "#D21165",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #0002",
                  }}
                >
                  ›
                </button>
              )}
            </div>

            {/* Popup Thumbnails */}
            {imageList.length > 1 && (
              <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                {imageList.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    style={{
                      width: "70px",
                      height: "70px",
                      padding: "4px",
                      background: "#fff",
                      border:
                        selectedImage === image
                          ? "2px solid #D21165"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            <p className="text-center text-muted small mt-3 mb-0">
              {currentIndex + 1} / {imageList.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
