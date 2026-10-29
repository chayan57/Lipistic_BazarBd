
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

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openOrder = (product) => {
    setSelectedProduct(product);
    setForm(initialForm);
    setMessage("");
    setError("");
  };

  const closeOrder = () => {
    if (loading) return;
    setSelectedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
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
          productId: selectedProduct.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order failed");
      }

      setMessage("Your order has been placed successfully!");
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lipstick-products-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="lipstick-section-label">
            BEAUTY COLLECTION
          </span>
          <h1 className="lipstick-section-title mt-2">
            Find Your Perfect Shade
          </h1>
          <p className="text-muted">
            Discover our exclusive lipstick collection.
          </p>
        </div>

        <div className="row g-3 g-md-4 justify-content-center">
          {products.map((product) => (
            <div
              className="col-6 col-md-5 col-lg-4"
              key={product.id}
            >
              <article className="lipstick-product-card h-100">
                <div className="lipstick-image-wrap">
                  <span className="lipstick-product-badge">
                    {product.badge}
                  </span>

                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 767px) 50vw, 33vw"
                    className="lipstick-product-image"
                  />
                </div>

                <div className="lipstick-product-info">
                  <small className="lipstick-product-brand">
                    Lipistic Bazar
                  </small>

                  <h2 className="lipstick-product-name">
                    {product.name}
                  </h2>

                  <p className="lipstick-product-description">
                    {product.description}
                  </p>

                  <div className="lipstick-price-row mb-3">
                    <span className="lipstick-current-price text-black">
                      Tk{product.price}
                    </span>
                    <del className="lipstick-old-price">
                      Tk{product.oldPrice}
                    </del>
                  </div>

                  <button
                    type="button"
                    className="lipstick-add-cart-btn"
                    onClick={() => openOrder(product)}
                  >
                    Order Now <span>→</span>
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <div
          className="lipstick-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeOrder();
          }}
        >
          <div
            className="lipstick-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 id="order-title" className="m-0">
                Place Your Order
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={closeOrder}
                disabled={loading}
                aria-label="Close"
              />
            </div>

            {message ? (
              <div className="text-center py-4">
                <div className="text-success fs-1">✓</div>
                <h4>Order Confirmed!</h4>
                <p>{message}</p>
                <button
                  className="lipstick-add-cart-btn"
                  onClick={closeOrder}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="lipstick-order-product mb-3">
                  <Image
                    src={selectedProduct.image}
                    width={65}
                    height={65}
                    alt={selectedProduct.name}
                    style={{ objectFit: "contain" }}
                  />
                  <div>
                    <strong>{selectedProduct.name}</strong>
                    <div className="text-danger fw-bold">
                      Tk{selectedProduct.price}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="order-name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    id="order-name"
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

                <div className="mb-3">
                  <label htmlFor="order-phone" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="01XXXXXXXXX"
                    pattern="01[0-9]{9}"
                    title="Enter a valid 11-digit Bangladeshi number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="order-address" className="form-label">
                    Full Delivery Address *
                  </label>
                  <textarea
                    id="order-address"
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

                <div className="mb-3">
                  <label htmlFor="order-quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    id="order-quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    max="20"
                    className="form-control"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="lipstick-order-total">
                  <span>Total Price</span>
                  <strong>
                    Tk{selectedProduct.price *
                      (Number(form.quantity) || 0)}
                  </strong>
                </div>

                <p className="text-muted small mt-2">
                  Delivery charge is not included.
                  Payment: Cash on Delivery.
                </p>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="lipstick-add-cart-btn mt-3"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Confirm Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
