
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCart } from "./store/cartSlice";

const CACHE_KEY = "dazro_products_cache";

async function getJsonResponse(response) {
  const text = await response.text();
  if (!text) throw new Error(`Empty server response (${response.status})`);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }
}

const imageUrl = (image) =>
  typeof image === "string" ? image : image?.url || "";

export default function ProductDetails() {
  const { id: productId } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [imagePopup, setImagePopup] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedReviewSummaries, setRelatedReviewSummaries] = useState({});

  const [reviews, setReviews] = useState([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(5);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [myReview, setMyReview] = useState(null);

  // Fetch product
  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setQuantity(1);

        const response = await fetch(
          `/api/products?id=${encodeURIComponent(productId)}`,
          { cache: "no-store", signal: controller.signal }
        );

        const data = await getJsonResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch product.");
        }

        setProduct(data.product);
        setSelectedImage(imageUrl(data.product?.images?.[0]));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [productId]);

  // Refresh product when returning to tab
  useEffect(() => {
    if (!productId) return;

    async function refreshProduct() {
      if (document.visibilityState !== "visible") return;

      try {
        const response = await fetch(
          `/api/products?id=${encodeURIComponent(productId)}`,
          { cache: "no-store" }
        );
        const data = await getJsonResponse(response);

        if (response.ok && data.success && data.product) {
          setProduct(data.product);
          setSelectedImage((current) =>
            current || imageUrl(data.product.images?.[0])
          );
        }
      } catch (err) {
        console.error("Product refresh error:", err);
      }
    }

    document.addEventListener("visibilitychange", refreshProduct);
    return () =>
      document.removeEventListener("visibilitychange", refreshProduct);
  }, [productId]);

  // Authentication
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.status === 401) {
          if (mounted) setLoggedIn(false);
          return;
        }

        const data = await getJsonResponse(response);
        if (mounted) {
          setLoggedIn(Boolean(response.ok && data.success && data.user));
        }
      } catch {
        if (mounted) setLoggedIn(false);
      }
    }

    checkAuth();
    return () => { mounted = false; };
  }, []);

  // Fetch reviews
  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    async function loadReviews() {
      try {
        setReviewLoading(true);

        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}`,
          { cache: "no-store" }
        );

        const data = await getJsonResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load reviews.");
        }

        if (!mounted) return;

        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setAverageRating(Number(data.summary?.averageRating || 0));
        setReviewCount(Number(data.summary?.reviewCount || 0));
        setMyReview(data.user?.myReview || null);
        setVisibleReviewCount(5);

        if (typeof data.user?.loggedIn === "boolean") {
          setLoggedIn(data.user.loggedIn);
        }
      } catch (err) {
        if (mounted) {
          console.error("Reviews error:", err);
          setReviews([]);
          setAverageRating(0);
          setReviewCount(0);
          setMyReview(null);
        }
      } finally {
        if (mounted) setReviewLoading(false);
      }
    }

    loadReviews();
    return () => { mounted = false; };
  }, [productId]);

  // Related products
  useEffect(() => {
    if (!product?._id) return;

    let mounted = true;

    async function loadRelated() {
      try {
        let allProducts = [];

        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            const list = Array.isArray(parsed)
              ? parsed
              : parsed?.products;

            if (Array.isArray(list)) allProducts = list;
          }
        } catch (err) {
          console.error("Product cache error:", err);
        }

        if (!allProducts.length) {
          const response = await fetch("/api/products", {
            cache: "no-store",
          });
          const data = await getJsonResponse(response);

          if (response.ok && data.success) {
            allProducts = Array.isArray(data.products)
              ? data.products
              : [];
          }
        }

        const categoryId = String(
          product.category?._id || product.category || ""
        );

        const related = allProducts
          .filter((item) =>
            String(item._id) !== String(product._id) &&
            String(item.category?._id || item.category || "") === categoryId
          )
          .slice(0, 4);

        if (mounted) setRelatedProducts(related);
      } catch (err) {
        console.error("Related products error:", err);
        if (mounted) setRelatedProducts([]);
      }
    }

    loadRelated();
    return () => { mounted = false; };
  }, [product]);

  // Related review summaries
  useEffect(() => {
    if (!relatedProducts.length) {
      setRelatedReviewSummaries({});
      return;
    }

    const controller = new AbortController();

    async function loadSummaries() {
      const results = await Promise.all(
        relatedProducts.map(async (item) => {
          try {
            const response = await fetch(
              `/api/reviews?productId=${encodeURIComponent(item._id)}`,
              { cache: "no-store", signal: controller.signal }
            );
            const data = await getJsonResponse(response);

            return {
              id: item._id,
              averageRating: response.ok && data.success
                ? Number(data.summary?.averageRating || 0)
                : 0,
              reviewCount: response.ok && data.success
                ? Number(data.summary?.reviewCount || 0)
                : 0,
            };
          } catch {
            return { id: item._id, averageRating: 0, reviewCount: 0 };
          }
        })
      );

      if (!controller.signal.aborted) {
        setRelatedReviewSummaries(
          Object.fromEntries(results.map(({ id, ...rest }) => [id, rest]))
        );
      }
    }

    loadSummaries();
    return () => controller.abort();
  }, [relatedProducts]);

  // Image popup: Escape + scroll lock
  useEffect(() => {
    if (!imagePopup) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setImagePopup(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imagePopup]);

  // Add to cart
  const handleAddToCart = async () => {
    if (!product || adding) return;

    const stock = Number(product.stock || 0);
    if (stock <= 0) return;

    if (quantity > stock) {
      setError(`Only ${stock} items available.`);
      return;
    }

    try {
      setAdding(true);
      setError("");

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await getJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart.");
      }

      dispatch(setCart(data.cart?.items || []));
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (err) {
      setError(err.message || "Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    setReviewMessage("");
    setReviewMessageType("");

    if (!loggedIn) {
      setReviewMessage("Please login to submit a review.");
      setReviewMessageType("error");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewMessage("Please select a rating.");
      setReviewMessageType("error");
      return;
    }

    const comment = reviewComment.trim();

    if (!comment || comment.length > 2000) {
      setReviewMessage(
        !comment
          ? "Please write your review."
          : "Review cannot exceed 2000 characters."
      );
      setReviewMessageType("error");
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: reviewRating,
          comment,
        }),
      });

      const data = await getJsonResponse(response);

      if (!response.ok || !data.success) {
        if (response.status === 409 && data.review) {
          setMyReview(data.review);
        }
        throw new Error(data.message || "Failed to submit review.");
      }

      setMyReview(data.review || null);
      setReviewRating(0);
      setReviewComment("");
      setReviewMessageType("success");
      setReviewMessage(
        data.message || "Review submitted and waiting for approval."
      );
    } catch (err) {
      setReviewMessageType("error");
      setReviewMessage(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="dazro-product-details-page">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status" />
          <p className="mt-3">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || "Product not found."}
        </div>
      </main>
    );
  }

  const images = (Array.isArray(product.images) ? product.images : [])
    .map(imageUrl)
    .filter(Boolean);

  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const canWriteReview =
    loggedIn &&
    (!myReview ||
      String(myReview.status || "").toLowerCase() === "rejected");

  return (
    <main className="dazro-product-details-page">
      <div className="container py-4 py-lg-5">
        <Link href="/products" className="dazro-product-back">
          ← Back to Products
        </Link>

        <div className="row g-4 g-lg-5 mt-1">
          {/* Product Image Gallery */}
          <div className="col-12 col-lg-6">
            <div
              className="dazro-details-main-image"
              onClick={() => selectedImage && setImagePopup(true)}
              style={{ cursor: selectedImage ? "zoom-in" : "default" }}
            >
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} />
              ) : (
                <span>No Image</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`dazro-details-thumb ${
                      selectedImage === image ? "active" : ""
                    }`}
                    style={{
                      width: 64,
                      height: 64,
                      padding: 4,
                      border: selectedImage === image
                        ? "2px solid #D21165"
                        : "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
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
          </div>

          {/* Product Information */}
          <div className="col-12 col-lg-6">
            {product.brand && (
              <div className="dazro-details-brand">{product.brand}</div>
            )}

            <h1 className="dazro-details-title">{product.name}</h1>

            {product.shortDescription && (
              <p className="dazro-details-short">
                {product.shortDescription}
              </p>
            )}

            <div className="dazro-product-rating-preview">
              <span className="dazro-rating-stars">
                {averageRating > 0
                  ? "★".repeat(Math.round(averageRating))
                  : "☆☆☆☆☆"}
              </span>
              <span className="dazro-rating-number">
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "No rating"}
              </span>
              <span className="dazro-rating-count">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="dazro-details-price-row">
              <strong>
                ৳{Number(product.price || 0).toLocaleString()}
              </strong>
              {Number(product.oldPrice || 0) > 0 && (
                <span>
                  ৳{Number(product.oldPrice).toLocaleString()}
                </span>
              )}
            </div>

            <div className="dazro-details-stock">
              {isOutOfStock ? (
                <span className="out">Out of stock</span>
              ) : (
                <span>{stock} available</span>
              )}
            </div>

            <hr className="my-4" />

            {error && (
              <div className="alert alert-danger py-2">{error}</div>
            )}

            {!isOutOfStock && (
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="dazro-details-quantity">
                  <button
                    type="button"
                    disabled={quantity <= 1 || adding}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
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
                <span className="text-muted small">Quantity</span>
              </div>
            )}

            <button
              type="button"
              className="btn dazro-details-cart-btn"
              style={{ backgroundColor: "#ff9898" }}
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
            >
              {isOutOfStock
                ? "Out of Stock"
                : adding
                ? "Adding..."
                : added
                ? "Added to Cart ✓"
                : "Add to Cart"}
            </button>

            {product.description && (
              <div className="mt-5">
                <h3 className="dazro-description-title">
                  Product Description
                </h3>
                <div
                  className="dazro-product-description"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              </div>
            )}

            <div className="dazro-details-meta mt-4">
              {product.category?.name && (
                <div>
                  <span>Category</span>
                  <strong>{product.category.name}</strong>
                </div>
              )}
              {product.sku && (
                <div>
                  <span>SKU</span>
                  <strong>{product.sku}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Popup */}
        {imagePopup && selectedImage && (
          <div
            role="presentation"
            onClick={() => setImagePopup(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0,0,0,.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 15,
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${product.name} image gallery`}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 700,
                maxHeight: "95vh",
                overflowY: "auto",
                background: "#fff",
                padding: 20,
                borderRadius: 12,
              }}
            >
              <button
                type="button"
                className="btn-close position-absolute"
                aria-label="Close"
                onClick={() => setImagePopup(false)}
                style={{ top: 15, right: 15 }}
              />

              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: "100%",
                  height: 380,
                  maxHeight: "55vh",
                  objectFit: "contain",
                }}
              />

              {images.length > 1 && (
                <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      style={{
                        width: 65,
                        height: 65,
                        padding: 4,
                        background: "#fff",
                        border: selectedImage === image
                          ? "2px solid #D21165"
                          : "1px solid #ddd",
                        borderRadius: 8,
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
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
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <section className="dazro-reviews-section">
          <div className="dazro-reviews-header">
            <div>
              <span className="dazro-reviews-label">
                Customer Feedback
              </span>
              <h2 className="dazro-reviews-title">
                Customer Reviews
              </h2>
            </div>

            <div className="dazro-reviews-summary">
              <strong>
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </strong>
              <div>
                <div className="dazro-review-summary-stars">
                  {averageRating > 0
                    ? "★".repeat(Math.round(averageRating))
                    : "☆☆☆☆☆"}
                </div>
                <span>
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          {reviewLoading ? (
            <div className="dazro-reviews-loading">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />
              <span>Loading reviews...</span>
            </div>
          ) : canWriteReview ? (
            <div className="dazro-write-review-card">
              <div className="dazro-write-review-heading">
                <h3>
                  {myReview?.status === "rejected"
                    ? "Submit a New Review"
                    : "Write a Review"}
                </h3>
                <p>Share your experience with this product.</p>
              </div>

              <div className="dazro-review-rating-selector">
                <span>Your Rating</span>
                <div className="dazro-review-stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= reviewRating ? "active" : ""}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="form-control dazro-review-textarea"
                rows={5}
                maxLength={2000}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell other customers about your experience..."
              />

              {reviewMessage && (
                <div
                  className={`dazro-review-message ${
                    reviewMessageType === "success"
                      ? "success"
                      : "error"
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              <button
                type="button"
                className="btn dazro-review-submit-btn"
                disabled={reviewSubmitting}
                onClick={handleSubmitReview}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          ) : myReview ? (
            <div className="dazro-review-pending-box">
              <strong>Review submitted</strong>
              <p className="mb-0">
                {myReview.status === "approved"
                  ? "Your review has been approved."
                  : "Your review is waiting for admin approval."}
              </p>
            </div>
          ) : (
            <div className="dazro-review-pending-box">
              <strong>Login to write a review</strong>
              <p className="mb-2">
                Please login to share your experience with this product.
              </p>
              <Link
                href="/login"
                className="btn dazro-review-submit-btn mt-2"
              >
                Login
              </Link>
            </div>
          )}

          {!reviewLoading && (
            reviews.length ? (
              <div className="dazro-reviews-list">
                {reviews.slice(0, visibleReviewCount).map((review) => {
                  const customerName =
                    review.customer?.name ||
                    review.user?.name ||
                    "Customer";

                  const rating = Math.min(
                    5,
                    Math.max(0, Math.round(Number(review.rating || 0)))
                  );

                  return (
                    <article
                      key={review._id}
                      className="dazro-review-card"
                    >
                      <div className="dazro-review-card-top">
                        <div className="dazro-review-avatar">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{customerName}</h4>
                          <div className="dazro-review-stars">
                            <span>{"★".repeat(rating)}</span>
                            <span style={{ color: "#ddd" }}>
                              {"★".repeat(5 - rating)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p>{review.comment}</p>
                      <small>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(
                              "en-BD",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : ""}
                      </small>
                    </article>
                  );
                })}

                {visibleReviewCount < reviews.length && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="btn dazro-load-more-reviews"
                      onClick={() =>
                        setVisibleReviewCount((count) => count + 5)
                      }
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="dazro-no-reviews">
                <div className="dazro-no-reviews-icon">★</div>
                <h3>No reviews yet</h3>
                <p>Be the first customer to review this product.</p>
              </div>
            )
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="dazro-related-products-section">
            <div className="dazro-related-products-header">
              <div>
                <span className="dazro-related-products-label">
                  You may also like
                </span>
                <h2 className="dazro-related-products-title">
                  Related Products
                </h2>
                <p className="dazro-related-products-subtitle">
                  More products from the same category.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {relatedProducts.map((item) => {
                const image = imageUrl(item.images?.[0]);
                const itemStock = Number(item.stock || 0);
                const relatedReview =
                  relatedReviewSummaries[item._id] || {
                    averageRating: 0,
                    reviewCount: 0,
                  };

                return (
                  <div
                    key={item._id}
                    className="col-12 col-sm-6 col-lg-3"
                  >
                    <div className="dazro-product-card">
                      <Link
                        href={`/products/${item._id}`}
                        className="text-decoration-none"
                      >
                        <div className="dazro-product-image-wrap">
                          {image ? (
                            <>
                              <img
                                src={image}
                                alt={item.name}
                                className="dazro-product-image"
                                loading="lazy"
                              />
                              <span className="dazro-product-shine" />
                            </>
                          ) : (
                            <div className="dazro-product-no-image">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-3">
                        {item.brand && (
                          <small className="dazro-product-brand">
                            {item.brand}
                          </small>
                        )}

                        {relatedReview.reviewCount > 0 && (
                          <div className="dazro-product-review-summary">
                            <span className="dazro-product-review-stars">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= Math.round(
                                      relatedReview.averageRating
                                    )
                                      ? "active"
                                      : ""
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </span>
                            <span className="dazro-product-review-rating">
                              {relatedReview.averageRating.toFixed(1)}
                            </span>
                            <span className="dazro-product-review-count">
                              ({relatedReview.reviewCount})
                            </span>
                          </div>
                        )}

                        <Link
                          href={`/products/${item._id}`}
                          className="text-decoration-none"
                        >
                          <h3 className="dazro-product-name">
                            {item.name}
                          </h3>
                        </Link>

                        <div className="dazro-product-price">
                          ৳{Number(item.price || 0).toLocaleString()}
                        </div>

                        {Number(item.oldPrice || 0) > 0 && (
                          <div className="dazro-product-old-price">
                            ৳{Number(item.oldPrice).toLocaleString()}
                          </div>
                        )}

                        {itemStock <= 0 ? (
                          <div className="dazro-product-stock-out">
                            Out of stock
                          </div>
                        ) : (
                          <div className="dazro-product-stock">
                            {itemStock} available
                          </div>
                        )}

                        <Link
                          href={`/products/${item._id}`}
                          className="btn dazro-related-view-btn"
                        >
                          View Product <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
