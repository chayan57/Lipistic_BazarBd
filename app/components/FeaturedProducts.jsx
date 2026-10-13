
import Image from "next/image";
import Link from "next/link";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import Product from "@/models/Product";
import dbConnect from "@/lib/connectDB";

async function FeaturedProducts() {
  await dbConnect();

  // First fetch active products without requiring isFeatured
  const products = await Product.find({
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean();

  // Find watch products using their names
  const watches = products
    .filter((product) =>
      /watch/i.test(product.name || "")
    )
    .slice(0, 4);

  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <p
              className="fw-semibold mb-1"
              style={{ color: "#D21165" }}
            >
              Featured Watches
            </p>

            <h2 className="fw-bold mb-2">
              Our Featured Watches
            </h2>

            <p className="text-muted mb-0">
              Explore our featured watch collection.
            </p>
          </div>

          <Link
            href="/products"
            className="fw-semibold text-decoration-none mt-3 mt-md-0"
            style={{ color: "#D21165" }}
          >
            View All Products →
          </Link>
        </div>

        {watches.length > 0 ? (
          <div className="row g-4">
            {watches.map((product) => {
              const firstImage = product.images?.[0];

              const image =
                typeof firstImage === "string"
                  ? firstImage
                  : firstImage?.url || product.image || "";

              return (
                <div
                  className="col-12 col-sm-6 col-lg-3"
                  key={product._id.toString()}
                >
                  <article className="product-card bg-white rounded-4 overflow-hidden h-100">
                    <Link
                      href={`/products/${product._id.toString()}`}
                      className="text-decoration-none"
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
                            ৳{product.price}
                          </span>

                          {Number(product.oldPrice) >
                            Number(product.price) && (
                            <span
                              className="text-muted text-decoration-line-through"
                              style={{ fontSize: "13px" }}
                            >
                              ৳{product.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

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
                      >
                        <ShoppingCartOutlinedIcon fontSize="small" />
                        Add to Cart
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted mt-4">
            No active watch products found.
          </p>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
