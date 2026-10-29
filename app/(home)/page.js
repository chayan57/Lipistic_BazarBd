
import Image from "next/image";
import Link from "next/link";

import Features from "../components/Features";
import Categories from "../components/Categories";
import SpecialOffer from "../components/SpecialOffer";
import WhyChoose from "../components/WhyChoose";
import Reviews from "../components/Reviews";
import CTA from "../components/CTA";
import Lipistics from "../components/Lipistics";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#FFF2F8" }}>
      {/* Hero Section */}
      <section
        className="dazro-hero"
        style={{
          background:
            "linear-gradient(180deg, #D21165 0%, #D21165 70%, #FFF2F8 100%)",
        }}
      >
        <div className="container">
          <div className="row align-items-center g-3 g-lg-4">

            {/* Left Content */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <div className="dazro-hero-content">
                <p className="dazro-hero-label fw-semibold mb-2">
                  Welcome to Lipistic Bazar Bd
                </p>

                <h1 className="dazro-hero-title fw-bold text-white mb-3">
                  Shop Everything
                  <br className="d-none d-sm-block" />
                  {" "}You Love
                </h1>

                <p className="dazro-hero-description text-white mb-3">
                  Discover quality products, great deals, and
                  everyday essentials—all in one place.
                </p>

                <Link
                  href="/products"
                  className="btn btn-light fw-semibold dazro-hero-btn"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="col-12 col-lg-6">
              <div className="dazro-hero-image mx-auto">
                <Image
                  src="/lipistic.png"
                  alt="DazroShop online shopping products in Bangladesh"
                  width={600}
                  height={500}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="img-fluid rounded-2"
                  style={{
                   
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Categories />
      <Lipistics/>
      <SpecialOffer />
      <Features />
      <Reviews />
      <WhyChoose />
      <CTA />
    </main>
  );
}
