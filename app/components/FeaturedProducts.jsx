
import Link from "next/link";
import Product from "@/models/Product";
import dbConnect from "@/lib/connectDB";
import FeaturedWatchCards from "./FeaturedWatchCards";

async function FeaturedProducts() {
  await dbConnect();

  const products = await Product.find({
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean();

  const watches = products
    .filter((product) => /watch/i.test(product.name || ""))
    .slice(0, 4)
    .map((product) => ({
      _id: product._id.toString(),
      name: product.name || "",
      brand: product.brand || "",
      price: Number(product.price || 0),
      oldPrice: Number(product.oldPrice || 0),
      stock: Number(product.stock || 0),
      images: (product.images || []).map((image) =>
        typeof image === "string" ? image : image?.url || ""
      ),
      shortDescription: product.shortDescription || "",
      sku: product.sku || "",
    }));

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
          <FeaturedWatchCards products={watches} />
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
