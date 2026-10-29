
import Link from "next/link";
import { Phone, ArrowUpRight } from "lucide-react";
import { Facebook } from "@mui/icons-material";

export default function ContactPage() {
  return (
    <main className="contact-page">
   
     

      {/* Contact Information */}
      <section className="contact-main-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="contact-small-title">
              CONTACT INFORMATION
            </span>

            <h2 className="contact-main-heading mt-3">
              We're Here to Help You
            </h2>

            <p className="text-muted">
              Get in touch with us through phone or Facebook.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Phone */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="contact-method-card">
                <div className="contact-method-icon">
                  <Phone size={30} />
                </div>

                <h3>Call Us</h3>

                <p>
                  Need help with your order?
                  Give us a call anytime during
                  our support hours.
                </p>

                <span className="contact-method-detail">
                  01XXXXXXXXX
                </span>

                <a
                  href="tel:01XXXXXXXXX"
                  className="contact-method-btn"
                >
                  Call Now
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>

            {/* Facebook */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="contact-method-card">
                <div className="contact-method-icon">
                  <Facebook sx={{ fontSize: 34 }} />
                </div>

                <h3>Facebook Page</h3>

                <p>
                  Connect with us on Facebook
                  for product updates, new arrivals
                  and customer support.
                </p>

                <span className="contact-method-detail">
                  Lipistic Bazar
                </span>

                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-method-btn"
                >
                  Visit Facebook
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="contact-bottom-section">
        <div className="container text-center">
          <span>DISCOVER YOUR BEAUTY</span>

          <h2>Find Your Perfect Shade</h2>

          <p>
            Explore our beautiful lipstick collection
            and discover your next favorite shade.
          </p>

          <Link href="/#products" className="contact-shop-btn">
            Shop Collection
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
