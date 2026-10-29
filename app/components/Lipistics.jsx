
"use client";

import { useState } from "react";
import Image from "next/image";

const products = [
  {
    id: "lipstick-1",
    name: "Makup Rich Lipstick Set",
    description: "Long-lasting rich color with a smooth matte finish.",
    price: 500,
    oldPrice: 650,
    image: "/lipistic.png",
    badge: "Best Seller",
  },
  {
    id: "lipstick-2",
    name: "Luxury Lipstick Set",
    description: "Soft creamy texture for a beautiful everyday look.",
    price: 550,
    oldPrice: 750,
    image: "/good-lipistic.png",
    badge: "New Arrival",
  },
];

const initialForm = {
  name: "",
  phone: "",
  address: "",
  quantity: 1,
};

export default function Lipistics() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const openOrderForm = (product) => {
    setSelectedProduct(product);
    setForm(initialForm);
    setSuccess(false);
    setError("");
  };

  const closeOrderForm = () => {
    if (loading) return;
    setSelectedProduct(null);
    setSuccess(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: `lipstick-${selectedProduct.id}`,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to place order."
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lipistics-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="lipistics-subtitle">
            BEAUTY COLLECTION
          </span>

          <h2 className="lipistics-heading mt-2">
            Discover Your Perfect Shade
          </h2>

          <p className="lipistics-description mx-auto">
            Explore our exclusive lipstick collection,
            crafted to bring elegance and confidence
            to your everyday look.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {products.map((product) => (
            <div
              className="col-12 col-md-6 col-lg-5"
              key={product.id}
            >
              <div className="lipistics-card h-100">
                <div className="lipistics-image-wrapper">
                  <span className="lipistics-badge">
                    {product.badge}
                  </span>

                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="lipistics-product-image"
                  />
                </div>

                <div className="lipistics-card-content">
                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="lipistics-price text-black">
                      Tk{product.price}
                    </span>

                    <del className="lipistics-old-price">
                      Tk{product.oldPrice}
                    </del>
                  </div>

                  <button
                    type="button"
                    className="lipistics-cart-btn"
                    onClick={() => openOrderForm(product)}
                  >
                    Order Now <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Form Popup */}
      {selectedProduct && (
        <div
          className="lipistics-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeOrderForm();
            }
          }}
        >
          <div
            className="lipistics-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lipistics-order-title"
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3
                id="lipistics-order-title"
                className="lipistics-modal-title mb-0"
              >
                {success ? "Order Confirmed" : "Place Your Order"}
              </h3>

              <button
                type="button"
                className="btn-close"
                onClick={closeOrderForm}
                disabled={loading}
                aria-label="Close"
              />
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="lipistics-success-icon">
                  ✓
                </div>

                <h4 className="mt-3">
                  Thank You For Your Order!
                </h4>

                <p className="text-muted">
                  Your order has been submitted successfully.
                  We will contact you soon.
                </p>

                <button
                  type="button"
                  className="lipistics-cart-btn"
                  onClick={closeOrderForm}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit}>
                {/* Selected Product */}
                <div className="lipistics-selected-product mb-4">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    width={75}
                    height={75}
                    style={{ objectFit: "contain" }}
                  />

                  <div>
                    <h5 className="mb-1">
                      {selectedProduct.name}
                    </h5>

                    <strong className="lipistics-price">
                      Tk{selectedProduct.price}
                    </strong>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="mb-3">
                  <label
                    htmlFor="lipistics-name"
                    className="form-label"
                  >
                    Full Name *
                  </label>

                  <input
                    id="lipistics-name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label
                    htmlFor="lipistics-phone"
                    className="form-label"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="lipistics-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="01XXXXXXXXX"
                    pattern="01[0-9]{9}"
                    title="Enter a valid 11-digit Bangladeshi phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Delivery Address */}
                <div className="mb-3">
                  <label
                    htmlFor="lipistics-address"
                    className="form-label"
                  >
                    Full Delivery Address *
                  </label>

                  <textarea
                    id="lipistics-address"
                    name="address"
                    className="form-control"
                    rows={3}
                    placeholder="Village, Road, Area, District"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={500}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="mb-3">
                  <label className="form-label">
                    Quantity
                  </label>

                  <div className="lipistics-quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          quantity: Math.max(
                            1,
                            Number(prev.quantity) - 1
                          ),
                        }))
                      }
                    >
                      −
                    </button>

                    <span>{form.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          quantity: Math.min(
                            20,
                            Number(prev.quantity) + 1
                          ),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="lipistics-order-total">
                  <span>Total Price</span>

                  <strong>
                    Tk
                    {(
                      selectedProduct.price *
                      Number(form.quantity)
                    ).toLocaleString()}
                  </strong>
                </div>

                <p className="small text-muted mt-2">
                  Cash on Delivery. Delivery charge not included.
                </p>

                {error && (
                  <div
                    className="alert alert-danger mt-3"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="lipistics-cart-btn mt-3"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting Order..."
                    : "Confirm Order →"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
