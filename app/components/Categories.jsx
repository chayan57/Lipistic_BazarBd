import Link from "next/link";
import WatchIcon from "@mui/icons-material/Watch";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

const categories = [
  {
    title: "Watches",
    icon: <WatchIcon sx={{ fontSize: 28 }} />,
    href: "/products?category=watches",
  },
  {
    title: "Gadgets",
    icon: <HeadphonesIcon sx={{ fontSize: 28 }} />,
    href: "/products?category=gadgets",
  },
  {
    title: "Fashion",
    icon: <CheckroomIcon sx={{ fontSize: 28 }} />,
    href: "/products?category=fashion",
  },
  {
    title: "Lifestyle",
    icon: <HomeOutlinedIcon sx={{ fontSize: 28 }} />,
    href: "/products?category=lifestyle",
  },
];

export default function Categories() {
  return (
    <section
      className="dazro-categories-section py-4 py-md-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        {/* Section Heading */}
        <div className="text-center mb-4">
          <p
            className="mb-1 fw-semibold"
            style={{ color: "#D21165" }}
          >
            Shop by Category
          </p>

          <h2 className="fw-bold mb-2">
            Explore Categories
          </h2>

          <p className="text-muted mb-0">
            Find the products you are looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="row g-3">
          {categories.map((category) => (
            <div
              className="col-6 col-md-4 col-lg-3"
              key={category.title}
            >
              <Link
                href={category.href}
                className="text-decoration-none d-block h-100"
                aria-label={`Shop ${category.title}`}
              >
                <div className="dazro-category-card bg-white rounded-4 text-center p-3 h-100">
                  {/* Category Icon */}
                  <div className="dazro-category-icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
                    {category.icon}
                  </div>

                  {/* Category Name */}
                  <h3 className="h6 fw-semibold text-dark mb-0">
                    {category.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}