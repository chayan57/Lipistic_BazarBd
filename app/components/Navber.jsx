
"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isProductPage = pathname.startsWith("/products/");

  useEffect(() => {
    if (!isProductPage) return;

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isProductPage]);

  const navButtonStyle = (active) => ({
    color: "#fff",
    backgroundColor: active
      ? "rgba(255,255,255,0.2)"
      : "transparent",
    textTransform: "none",
    fontWeight: 600,
    fontSize: { xs: "12px", sm: "15px" },
    minWidth: "auto",
    px: { xs: 1, sm: 2 },
    py: 1,
    borderRadius: "8px",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.25)",
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s ease",
  });

  return (
    <>
      {isProductPage && (
        <div aria-hidden="true" style={{ height: "91px" }} />
      )}

      <nav
        className="navbar shadow-sm"
        style={{
          backgroundColor: "#D21165",
          minHeight: "91px",
          position: isProductPage ? "fixed" : "relative",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1050,
          transform:
            isProductPage && !navVisible
              ? "translateY(-110%)"
              : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="container d-flex align-items-center justify-content-between flex-nowrap">

          {/* Logo */}
          <Link className="navbar-brand m-0" href="/">
            <Image
              src="/logo.png"
              alt="DazroShop"
              width={75}
              height={75}
              priority
              style={{
                width: "clamp(48px, 12vw, 75px)",
                height: "auto",
              }}
            />
          </Link>

          {/* Navigation Links */}
          <div className="d-flex align-items-center gap-1 gap-sm-2">
            <Button
              component={Link}
              href="/"
              sx={navButtonStyle(pathname === "/")}
            >
              Home
            </Button>

            <Button
              component={Link}
              href="/products"
              sx={navButtonStyle(
                pathname.startsWith("/products")
              )}
            >
              Products
            </Button>

           
          </div>
        </div>
      </nav>
    </>
  );
}
