
"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCart } from "./store/cartSlice";

export default function ProductQuickView({ product, onClose }) {
  const dispatch = useDispatch();

  const [details, setDetails] = useState(product);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  const productId = product?._id;

  const getImage = (image) =>
    typeof image === "string" ? image : image?.url || "";

  const images = Array.isArray(details?.images)
    ? details.images.map(getImage).filter(Boolean)
    : [];

  const stock = Number(details?.stock || 0);
  const outOfStock = stock <= 0;

  useEffect(() => {
    if (!productId) return;

    let active = true;
    setDetails(product);
    setSelectedImage(getImage(product.images?.[0]));
    setQuantity(1);
    setAdded(false);
    setError("");
    setReviews([]);
    setRating(0);
    setReviewCount(0);

    async function fetchDetails() {
      try {
        const response = await fetch(
          `/api/products?id=${encodeURIComponent(productId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (active && response.ok && data.success && data.product) {
          setDetails(data.product);
          setSelectedImage(getImage(data.product.images?.[0]));
        }
      } catch (err) {
        console.error("Quick view product error:", err);
      }
    }

    async function fetchReviews() {
      setReviewLoading(true);

      try {
        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (active && response.ok && data.success) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setRating(Number(data.summary?.averageRating || 0));
          setReviewCount(Number(data.summary?.reviewCount || 0));
        }
      } catch (err) {
        console.error("Quick view reviews error:", err);
      } finally {
        if (active) setReviewLoading(false);
      }
    }

    fetchDetails();
    fetchReviews();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!details?._id || adding || outOfStock) return;

    try {
      setAdding(true);
      setError("");

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: details._id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart.");
      }

      dispatch(setCart(data.cart?.items || []));
      setAdded(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  const discount =
    Number(details?.oldPrice || 0) > Number(details?.price || 0)
      ? Math.round(
          ((Number(details.oldPrice) - Number(details.price)) /
            Number(details.oldPrice)) *
            100
        )
      : 0;

  return (
    <div
      className="dazro-qv-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dazro-qv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${details?.name || "Product"} quick view`}
      >
        <button
          type="button"
          className="dazro-qv-close"
          onClick={onClose}
          aria-label="Close quick view"
        >
          ×
        </button>

        <div className="dazro-qv-grid">
          {/* Images */}
          <div className="dazro-qv-gallery">
            <div className="dazro-qv-main-image">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={details?.name || "Product"}
                />
              ) : (
                <span>No Image</span>
              )}

              {discount > 0 && (
                <span className="dazro-qv-discount">
                  -{discount}%
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="dazro-qv-thumbnails">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      selectedImage === image ? "active" : ""
                    }
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${details.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="dazro-qv-info">
            {details?.brand && (
              <span className="dazro-qv-brand">
                {details.brand}
              </span>
            )}

            <h2>{details?.name}</h2>

            <div className="dazro-qv-rating">
              <span>
                {"★".repeat(Math.round(rating))}
                {"☆".repeat(5 - Math.round(rating))}
              </span>
              <small>
                {rating.toFixed(1)} ({reviewCount} reviews)
              </small>
            </div>

            <div className="dazro-qv-price">
              <strong>
                ৳{Number(details?.price || 0).toLocaleString()}
              </strong>

              {Number(details?.oldPrice || 0) >
                Number(details?.price || 0) && (
                <del>
                  ৳{Number(details.oldPrice).toLocaleString()}
                </del>
              )}
            </div>

            {details?.shortDescription && (
              <p className="dazro-qv-short">
                {details.shortDescription}
              </p>
            )}

            <div className="dazro-qv-stock">
              {outOfStock ? (
                <span className="out">Out of Stock</span>
              ) : (
                <span>In Stock ({stock} available)</span>
              )}
            </div>

            {!outOfStock && (
              <div className="dazro-qv-quantity">
                <button
                  type="button"
                  disabled={quantity <= 1 || adding}
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  disabled={quantity >= stock || adding}
                  onClick={() =>
                    setQuantity((q) => Math.min(stock, q + 1))
                  }
                >
                  +
                </button>
              </div>
            )}

            <button
              type="button"
              className="dazro-qv-cart"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
            >
              {outOfStock
                ? "Out of Stock"
                : adding
                ? "Adding..."
                : added
                ? "✓ Added to Cart"
                : "Add to Cart"}
            </button>

            {error && (
              <p className="text-danger small mt-2">{error}</p>
            )}

            {details?.sku && (
              <p className="dazro-qv-meta">
                <strong>SKU:</strong> {details.sku}
              </p>
            )}

            {details?.category?.name && (
              <p className="dazro-qv-meta">
                <strong>Category:</strong> {details.category.name}
              </p>
            )}
          </div>
        </div>

        {/* Full Description */}
        {details?.description && (
          <section className="dazro-qv-section">
            <h3>Product Description</h3>
            <div
              className="dazro-qv-description"
              dangerouslySetInnerHTML={{
                __html: details.description,
              }}
            />
          </section>
        )}

        {/* Reviews */}
        <section className="dazro-qv-section">
          <h3>Customer Reviews ({reviewCount})</h3>

          {reviewLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            <div className="dazro-qv-reviews">
              {reviews.map((review) => (
                <div
                  className="dazro-qv-review"
                  key={review._id}
                >
                  <strong>
                    {review.customer?.name ||
                      review.user?.name ||
                      "Customer"}
                  </strong>

                  <div className="dazro-qv-rating">
                    {"★".repeat(
                      Math.min(5, Math.max(0, Math.round(
                        Number(review.rating || 0)
                      )))
                    )}
                  </div>

                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
