
"use client";

import { useState } from "react";
import Image from "next/image";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useDispatch } from "react-redux";
import { setCart } from "./store/cartSlice";
import ProductQuickView from "./ProductQuickView";



export default function FeaturedWatchCards({ products = [] }) {
  const dispatch = useDispatch();

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [cartError, setCartError] = useState("");

  const handleAddToCart = async (product) => {
    if (addingId || Number(product.stock || 0) <= 0) return;

    try {
      setAddingId(product._id);
      setCartError("");

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
        throw new Error(data.message || "Failed to add to cart.");
      }

      dispatch(setCart(data.cart?.items || []));
      setAddedId(product._id);

      setTimeout(() => {
        setAddedId((id) => (id === product._id ? null : id));
      }, 1200);
    } catch (error) {
      setCartError(error.message || "Failed to add to cart.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      {cartError && (
        <div className="alert alert-danger" role="alert">
          {cartError}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setCartError("")}
            aria-label="Dismiss error"
          />
        </div>
      )}

      <div className="row g-4">
        {products.map((product) => {
          const image = product.images?.[0] || "";
          const outOfStock = Number(product.stock || 0) <= 0;

          return (
            <div
              className="col-12 col-sm-6 col-lg-3"
              key={product._id}
            >
              <article className="product-card bg-white rounded-4 overflow-hidden h-100">
                {/* Click Product to Open Quick View */}
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(product)}
                  className="border-0 bg-transparent p-0 w-100 text-start"
                  style={{ cursor: "pointer" }}
                  aria-label={`Quick view ${product.name}`}
                >
                  <div
                    className="product-image-wrapper position-relative overflow-hidden"
                    style={{
                      height: "250px",
                      backgroundColor: "#FFF2F8",
                    }}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name || "Watch"}
                        fill
                        sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                        No image available
                      </div>
                    )}

                    <span className="shine-effect" />
                  </div>

                  <div className="p-3">
                    <h3
                      className="fw-semibold text-dark mb-2"
                      style={{
                        fontSize: "16px",
                        lineHeight: "1.5",
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className="fw-bold"
                        style={{
                          color: "#D21165",
                          fontSize: "18px",
                        }}
                      >
                        ৳{Number(product.price).toLocaleString()}
                      </span>

                      {Number(product.oldPrice) >
                        Number(product.price) && (
                        <span
                          className="text-muted text-decoration-line-through"
                          style={{ fontSize: "13px" }}
                        >
                          ৳{Number(product.oldPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Direct Add to Cart */}
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 addtoCartButton"
                    style={{
                      backgroundColor: "#D21165",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    disabled={outOfStock || addingId !== null}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCartOutlinedIcon fontSize="small" />

                    {outOfStock
                      ? "Out of Stock"
                      : addingId === product._id
                      ? "Adding..."
                      : addedId === product._id
                      ? "Added ✓"
                      : "Add to Cart"}
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Quick View Popup */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
