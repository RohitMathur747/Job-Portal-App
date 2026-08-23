import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navbarStyles as s } from "../assets/dummyStyles.js";
import {
  Briefcase,
  Building,
  ChevronDown,
  Home,
  List,
  UserCheck,
} from "lucide-react";
import logoFallback from "../assets/logo.png";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: Home },
  { key: "jobs", label: "Jobs", Icon: Briefcase },
  { key: "listJob", label: "List Job", Icon: List },
  { key: "company", label: "Companies", Icon: Building },
  {
    key: "companyQuestions",
    label: "Company Questions",
    Icon: Building,
    dropdown: [{ key: "listCompanyQ", label: "List Company Questions" }],
  },
  {
    key: "roleQuestions",
    label: "Role Questions",
    Icon: UserCheck,
    dropdown: [{ key: "listRoleQ", label: "List Role Questions" }],
  },
];

const ROUTES = {
  dashboard: "/",
  company: "/companies",
  jobs: "/addjobs",
  listJob: "/list/jobs",
  companyQuestions: "/company-questions",
  listCompanyQ: "/list/company-questions",
  roleQuestions: "/role-questions",
  listRoleQ: "/list/role-questions",
  login: "/login",
};

const Navbar = ({ logoSrc, brandName = "Job Portal", onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  const pathToKey = (pathname) => {
    const found = Object.entries(ROUTES).find(([key, path]) => {
      if (path === "/") return pathname === "/";
      return (
        pathname === path ||
        pathname.startsWith(path + "/") ||
        pathname.startsWith(path)
      );
    });
    return found ? found[0] : "dashboard";
  };

  const [active, setActive] = useState(pathToKey(location.pathname));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navContainerRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const [openDropdownKey, setOpenDropdownKey] = useState(null);
  const navCloseTimeoutRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isLGOnly = windowWidth >= 1024 && windowWidth < 1280;

  useEffect(() => {
    if (!isLGOnly) return;
    const handleDocClick = (e) => {
      const container = navContainerRef.current;
      if (!container) return;
      if (!container.contains(e.target)) {
        setOpenDropdownKey(null);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [isLGOnly]);

  //sync active state with current route
  useEffect(() => {
    const key = pathToKey(location.pathname);
    setActive(key);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Measure and update indicator position – useLayoutEffect prevents flicker
  const updateIndicator = useCallback(() => {
    const container = navContainerRef.current;
    const activeEl = itemRefs.current[active];
    if (!container || !activeEl) {
      setIndicatorStyle({ left: 0, width: 0 });
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicatorStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [active]);

  useLayoutEffect(() => {
    updateIndicator();
    let rafId = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateIndicator);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [updateIndicator]);

  const handleNavigate = (key) => {
    const path = ROUTES[key] ?? "/";
    setActive(key);
    onNavigate(key);
    navigate(path);
    setMobileMenuOpen(false);
    setOpenDropdownKey(null);
  };

  // to logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setMobileMenuOpen(false);
  };

  const logoToUse = logoSrc ?? logoFallback;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeTimeoutRef = useRef(null);
  const userMenuContainerRef = useRef(null);

  const openUserMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setUserMenuOpen(true);
  };
  const startCloseTimer = (delay = 250) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
      closeTimeoutRef.current = null;
    }, delay);
  };

  const openNavDropdown = (key) => {
    if (navCloseTimeoutRef.current) {
      clearTimeout(navCloseTimeoutRef.current);
      navCloseTimeoutRef.current = null;
    }
    setOpenDropdownKey(key);
  };
  const closeNavDropdownDelayed = (delay = 200) => {
    if (navCloseTimeoutRef.current) clearTimeout(navCloseTimeoutRef.current);
    navCloseTimeoutRef.current = setTimeout(() => {
      setOpenDropdownKey(null);
      navCloseTimeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (navCloseTimeoutRef.current) clearTimeout(navCloseTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <header className={s.header}>
        <nav className={s.nav}>
          <div className={s.navContainer}>
            <div className={s.navContent}>
              <div
                className={s.logoContainer}
                onClick={() => handleNavigate("dashboard")}
              >
                <div className={s.logoWrapper}>
                  {logoToUse ? (
                    <img src={logoToUse} alt="logo" className={s.logoImage} />
                  ) : (
                    <span className={s.logoFallback}>{brandName[0]}</span>
                  )}
                </div>
                <div
                  className={s.logoTextContainer}
                  style={{ marginRight: "200px" }}
                >
                  <span className={s.logoBrandName}>{brandName}</span>
                  <span className={s.logoSubtitle}>Find Your dream job</span>
                </div>

                {/* Desktop navigations */}
                <div className={s.desktopNav}>
                  <div
                    ref={navContainerRef}
                    className={s.navIndicatorContainer}
                  >
                    {active && indicatorStyle.width > 0 && (
                      <div
                        className={s.activeIndicator}
                        style={{
                          left: indicatorStyle.left,
                          width: indicatorStyle.width,
                          boxShadow: "0 0 8px rgba(165,180,252,0.5)",
                        }}
                      ></div>
                    )}
                    <ul className={s.navList}>
                      {NAV_ITEMS.map((item) => {
                        const IconComponent = item.Icon;
                        const isActiveParent =
                          active === item.key ||
                          (item.dropdown &&
                            isLGOnly &&
                            item.dropdown.some((sub) => active === sub.key));
                        return (
                          <React.Fragment key={item.key}>
                            <li
                              className={s.navItem}
                              onMouseEnter={() =>
                                item.dropdown &&
                                isLGOnly &&
                                openNavDropdown(item.key)
                              }
                              onMouseLeave={() =>
                                item.dropdown &&
                                isLGOnly &&
                                closeNavDropdownDelayed(200)
                              }
                            >
                              <div
                                ref={(el) => {
                                  itemRefs.current[item.key] = el;
                                  if (item.dropdown && el && isLGOnly) {
                                    item.dropdown.forEach((sub) => {
                                      itemRefs.current[sub.key] = el;
                                    });
                                  }
                                }}
                                className={s.navItemWrapper}
                              >
                                <button
                                  onClick={(e) => {
                                    if (item.dropdown && isLGOnly) {
                                      e.preventDefault();
                                      setOpenDropdownKey((prev) =>
                                        prev === item.key ? null : item.key,
                                      );
                                      return;
                                    }
                                    handleNavigate(item.key);
                                  }}
                                  className={`${s.navButton}${isActiveParent ? s.navButtonActive : s.navButtonInactive}`}
                                >
                                  <IconComponent className={s.navButtonIcon} />
                                  <span className={s.navButtonText}>
                                    {item.label}
                                  </span>
                                  {item.dropdown && isLGOnly && (
                                    <ChevronDown
                                      className={s.navDropdownIcon}
                                    />
                                  )}
                                </button>
                              </div>
                              {item.dropdown && isLGOnly && (
                                <div
                                  className={`${s.dropdownPanel} ${openDropdownKey === item.key ? s.dropdownVisible : s.dropdownHidden}`}
                                  onMouseEnter={() => openNavDropdown(item.key)}
                                  onMouseLeave={() =>
                                    closeNavDropdownDelayed(200)
                                  }
                                >
                                  <div className={s.dropdownCaret}></div>
                                  <div
                                    className={`${s.dropdownContent} ${openDropdownKey === item.key ? "animate-border" : "bg-transparent"}`}
                                    styles={{
                                      background:
                                        openDropdownKey === item.key
                                          ? undefined
                                          : "transparent",
                                    }}
                                  >
                                    <div className={s.dropdownInner}>
                                      {item.dropdown.map((sub) => {})}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </li>
                          </React.Fragment>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
