"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Navbar Scroll State
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef(0);

  const isProductPage = pathname.startsWith("/products");

  // Check Logged-in User
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setCheckingAuth(true);

        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!mounted) return;

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Navbar auth error:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Close Mobile Menu When Page Changes
  useEffect(() => {
    setMenuOpen(false);
    setNavVisible(true);
  }, [pathname]);

  // Hide Navbar on Scroll Down
  // Show Navbar on Scroll Up
  useEffect(() => {
    if (!isProductPage) {
      setNavVisible(true);
      return;
    }

    lastScrollY.current = window.scrollY;
    scrollDirection.current = 0;

    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);

      const difference =
        currentScrollY - lastScrollY.current;

      // Always show near the top or when menu is open
      if (currentScrollY <= 80 || menuOpen) {
        setNavVisible(true);
        scrollDirection.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }

      // Ignore tiny scroll movements
      if (Math.abs(difference) < 2) {
        return;
      }

      // Scrolling Down
      if (difference > 0) {
        if (scrollDirection.current < 0) {
          scrollDirection.current = 0;
        }

        scrollDirection.current += difference;

        if (scrollDirection.current > 12) {
          setNavVisible(false);
          scrollDirection.current = 0;
        }
      }

      // Scrolling Up
      if (difference < 0) {
        if (scrollDirection.current > 0) {
          scrollDirection.current = 0;
        }

        scrollDirection.current += difference;

        if (scrollDirection.current < -8) {
          setNavVisible(true);
          scrollDirection.current = 0;
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isProductPage, menuOpen]);

  // Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed.");
      }

      setUser(null);
      setMenuOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Navigation Button Styling
  const navButtonStyle = (active, outlined = false) => ({
    backgroundColor: active ? "#FFF2F8" : "transparent",
    color: active ? "#D21165" : "#FFFFFF",
    borderColor: outlined ? "#FFFFFF" : "transparent",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: "8px",
    px: 2.5,
    py: 1,

    width: {
      xs: "100%",
      lg: "auto",
    },

    justifyContent: {
      xs: "flex-start",
      lg: "center",
    },

    transition: "all 0.25s ease",

    "&:hover": {
      backgroundColor: "#FFF2F8",
      color: "#D21165",
      borderColor: "#FFFFFF",
    },
  });

  return (
    <>
      {/* Reserve Navbar Space on Product Pages */}
      {isProductPage && (
        <div
          aria-hidden="true"
          style={{
            height: "var(--dazro-navbar-height, 91px)",
          }}
        />
      )}

      <nav
        className="navbar navbar-expand-lg shadow-sm"
        style={{
          backgroundColor: "#D21165",
          minHeight: "70px",

          position: isProductPage
            ? "fixed"
            : "relative",

          top: 0,
          left: 0,
          right: 0,
          width: "100%",

          zIndex: 1050,

          transform:
            isProductPage && !navVisible && !menuOpen
              ? "translateY(-110%)"
              : "translateY(0)",

          transition:
            "transform 0.3s ease-in-out",

          willChange: isProductPage
            ? "transform"
            : "auto",
        }}
      >
        <div className="container">
          {/* Logo */}
          <Link
            className="navbar-brand"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="DazroShop"
              width={75}
              height={75}
              priority
            />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            className="navbar-toggler bg-white"
            type="button"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setNavVisible(true);
            }}
            aria-controls="navbarNav"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen
                ? "Close navigation"
                : "Open navigation"
            }
            style={{
              border: "none",
              boxShadow: "none",
              padding: "8px 12px",
              touchAction: "manipulation",
            }}
          >
            {menuOpen ? (
              <span
                style={{
                  fontSize: "25px",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "#D21165",
                }}
              >
                ×
              </span>
            ) : (
              <span className="navbar-toggler-icon" />
            )}
          </button>

          {/* Navigation Menu */}
          <div
            className={`navbar-collapse ${
              menuOpen ? "d-block" : "d-none"
            } d-lg-flex`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 py-2 py-lg-0">
              {/* Home */}
              <li className="nav-item">
                <Button
                  component={Link}
                  href="/"
                  variant="contained"
                  onClick={() => setMenuOpen(false)}
                  sx={navButtonStyle(pathname === "/")}
                >
                  Home
                </Button>
              </li>

              {/* Products */}
              <li className="nav-item">
                <Button
                  component={Link}
                  href="/products"
                  variant="text"
                  onClick={() => setMenuOpen(false)}
                  sx={navButtonStyle(
                    pathname.startsWith("/products")
                  )}
                >
                  Products
                </Button>
              </li>

              {/* Cart */}
              <li className="nav-item">
                <Button
                  component={Link}
                  href="/cart"
                  variant="text"
                  onClick={() => setMenuOpen(false)}
                  sx={navButtonStyle(
                    pathname.startsWith("/cart")
                  )}
                >
                  Cart
                </Button>
              </li>

              {/* My Orders */}
              {!checkingAuth && user && (
                <li className="nav-item">
                  <Button
                    component={Link}
                    href="/orders"
                    variant="text"
                    onClick={() => setMenuOpen(false)}
                    sx={navButtonStyle(
                      pathname.startsWith("/orders")
                    )}
                  >
                    My Orders
                  </Button>
                </li>
              )}

              {/* Login */}
              {!checkingAuth && !user && (
                <li className="nav-item">
                  <Button
                    component={Link}
                    href="/login"
                    variant="outlined"
                    onClick={() => setMenuOpen(false)}
                    sx={navButtonStyle(
                      pathname.startsWith("/login"),
                      true
                    )}
                  >
                    Login
                  </Button>
                </li>
              )}

              {/* Logout */}
              {!checkingAuth && user && (
                <li className="nav-item">
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    disabled={loggingOut}
                    sx={{
                      ...navButtonStyle(false, true),

                      "&.Mui-disabled": {
                        color: "#FFFFFF",
                        borderColor: "#FFFFFF",
                        opacity: 0.65,
                      },
                    }}
                  >
                    {loggingOut
                      ? "Logging out..."
                      : "Logout"}
                  </Button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}