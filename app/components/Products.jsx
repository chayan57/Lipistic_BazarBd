"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { setCart } from "./store/cartSlice";

import ProductQuickView from "./ProductQuickView";


function Products() {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [reviewSummaries, setReviewSummaries] = useState({});

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const isAddingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Products
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch products."
          );
        }

        setProducts(
          Array.isArray(data.products) ? data.products : []
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Products error:", err);
        setError(err.message || "Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  // Fetch Review Summaries
  useEffect(() => {
    if (!products.length) {
      setReviewSummaries({});
      return;
    }

    const controller = new AbortController();

    const fetchReviewSummaries = async () => {
      try {
        const results = await Promise.all(
          products.map(async (product) => {
            try {
              const response = await fetch(
                `/api/reviews?productId=${encodeURIComponent(
                  product._id
                )}`,
                {
                  method: "GET",
                  signal: controller.signal,
                  cache: "no-store",
                }
              );

              const data = await response.json();

              return {
                productId: product._id,
                averageRating:
                  response.ok && data.success
                    ? Number(data.summary?.averageRating || 0)
                    : 0,
                reviewCount:
                  response.ok && data.success
                    ? Number(data.summary?.reviewCount || 0)
                    : 0,
              };
            } catch (err) {
              if (err.name === "AbortError") throw err;

              console.error("Review summary error:", err);

              return {
                productId: product._id,
                averageRating: 0,
                reviewCount: 0,
              };
            }
          })
        );

        if (controller.signal.aborted) return;

        const summaryMap = {};

        results.forEach((item) => {
          summaryMap[item.productId] = {
            averageRating: item.averageRating,
            reviewCount: item.reviewCount,
          };
        });

        setReviewSummaries(summaryMap);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Review summaries error:", err);
        }
      }
    };

    fetchReviewSummaries();

    return () => controller.abort();
  }, [products]);

  // Add to Cart
  const handleAddToCart = useCallback(
    async (product) => {
      const stock = Number(product.stock || 0);

      if (stock <= 0 || isAddingRef.current) return;

      try {
        isAddingRef.current = true;
        setAddingId(product._id);
        setError("");

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to add product to cart."
          );
        }

        dispatch(setCart(data.cart?.items || []));
      } catch (err) {
        console.error("Add to cart error:", err);
        setError(err.message || "Failed to add product to cart.");
      } finally {
        isAddingRef.current = false;
        setAddingId(null);
      }
    },
    [dispatch]
  );

  // Open Quick View
  const openQuickView = useCallback((product) => {
    setQuickViewProduct(product);
  }, []);

  // Close Quick View
  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  if (loading && products.length === 0) {
    return (
      <main className="dazro-products-page">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status" />
          <p className="mt-3 mb-0 text-muted">
            Loading products...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dazro-products-page">
      <div className="container py-5">
        <div className="mb-4">
          <h1 className="dazro-products-title">
            Our Products
          </h1>

          <p className="dazro-products-subtitle">
            Discover our latest products.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!error && products.length === 0 && (
          <div className="text-center py-5">
            <h5>No products available.</h5>
          </div>
        )}

        <div className="row g-4">
          {products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              isAdding={addingId === product._id}
              onAddToCart={handleAddToCart}
              onQuickView={openQuickView}
              reviewSummary={
                reviewSummaries[product._id] || {
                  averageRating: 0,
                  reviewCount: 0,
                }
              }
            />
          ))}
        </div>
      </div>

      {/* Mobile and Desktop Quick View Popup */}
      {isMounted &&
        quickViewProduct &&
        createPortal(
          <ProductQuickView
            product={quickViewProduct}
            onClose={closeQuickView}
          />,
          document.body
        )}
    </main>
  );
}

// Product Card
const ProductCard = React.memo(
  ({
    product,
    index,
    isAdding,
    onAddToCart,
    onQuickView,
    reviewSummary,
  }) => {
    const firstImage = product.images?.[0];

    const image =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url || product.image || "";

    const stock = Number(product.stock || 0);
    const outOfStock = stock <= 0;

    const averageRating = Number(
      reviewSummary?.averageRating || 0
    );

    const reviewCount = Number(
      reviewSummary?.reviewCount || 0
    );

    const handleQuickViewClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onQuickView(product);
    };

    return (
      <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div className="dazro-product-card">
          {/* Product Image */}
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="border-0 bg-transparent p-0 w-100 text-start"
            style={{
              cursor: "pointer",
              touchAction: "manipulation",
            }}
            aria-label={`Quick view ${product.name}`}
          >
            <div className="dazro-product-image-wrap">
              {image ? (
                <>
                  <Image
                    src={image}
                    alt={product.name}
                    className="dazro-product-image"
                    width={400}
                    height={400}
                    priority={index < 4}
                  />
                  <span className="dazro-product-shine" />
                </>
              ) : (
                <div className="dazro-product-no-image">
                  No Image
                </div>
              )}
            </div>
          </button>

          {/* Product Information */}
          <div className="p-3">
            {product.brand && (
              <small className="dazro-product-brand">
                {product.brand}
              </small>
            )}

            {/* Review Summary */}
            {reviewCount > 0 && (
              <div className="dazro-product-review-summary">
                <span
                  className="dazro-product-review-stars"
                  aria-label={`${averageRating.toFixed(
                    1
                  )} out of 5 stars from ${reviewCount} reviews`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= Math.round(averageRating)
                          ? "active"
                          : ""
                      }
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </span>

                <span className="dazro-product-review-rating">
                  {averageRating.toFixed(1)}
                </span>

                <span className="dazro-product-review-count">
                  ({reviewCount})
                </span>
              </div>
            )}

            {/* Product Name */}
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="border-0 bg-transparent p-0 text-start w-100"
              style={{
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              <h3 className="dazro-product-name">
                {product.name}
              </h3>
            </button>

            {/* Product Price */}
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="border-0 bg-transparent p-0 text-start w-100"
              style={{
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              <div className="dazro-product-price">
                ৳ {Number(product.price || 0).toLocaleString()}
              </div>

              {Number(product.oldPrice || 0) > 0 && (
                <div className="dazro-product-old-price">
                  ৳ {Number(product.oldPrice).toLocaleString()}
                </div>
              )}
            </button>

            {/* Stock */}
            {outOfStock ? (
              <div className="dazro-product-stock-out">
                Out of stock
              </div>
            ) : (
              <div className="dazro-product-stock">
                {stock} available
              </div>
            )}

            {/* Add to Cart */}
            <button
              type="button"
              className="btn dazro-add-cart-btn"
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart(product);
              }}
              disabled={outOfStock || isAdding}
            >
              {outOfStock ? (
                "Out of Stock"
              ) : isAdding ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>Add to Cart</span>
                  <span className="dazro-cart-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default Products;