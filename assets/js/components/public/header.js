export function Header() {
  const isInPages = window.location.pathname.includes("/pages/");
  const basePath = isInPages ? "../" : "";

  // Auth check
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    console.error("Error parsing user data:", e);
    localStorage.removeItem("user");
  }
  const isLoggedIn = !!user;
  const userName =
    user?.fullName ||
    user?.full_name ||
    user?.username ||
    user?.name ||
    user?.email ||
    "User";

  console.log("User data:", user);
  console.log("User name:", userName);

  /* =====================
     NAVIGATION MENU
  ====================== */
  const userNav = isLoggedIn
    ? `<li>
        <a href="#">Welcome, ${userName} <i class="ti-angle-down"></i></a>
        <ul class="submenu">
          <li><a href="${basePath}user-dashboard.html">Dashboard</a></li>
          <li><a href="#" onclick="logout(); return false;">Logout</a></li>
        </ul>
      </li>`
    : `<li><a href="#test-form" class="login popup-with-form">Login</a></li>`;

  /* =====================
     AUTH SECTION (RIGHT)
  ====================== */
  const authSection = "";

  return `
<header>
  <div class="header-area">
    <div id="sticky-header" class="main-header-area">
      <div class="container-fluid p-0">
        <div class="row align-items-center no-gutters">
          
          <!-- Logo -->
          <div class="col-xl-2 col-lg-2">
            <div class="logo-img">
              <a href="${basePath}index.html">
                <img src="${basePath}assets/img/logo.png" alt="Logo">
              </a>
            </div>
          </div>

          <!-- Main Navigation -->
          <div class="col-xl-10 col-lg-10">
            <div class="main-menu d-none d-lg-block">
              <nav>
                <ul id="navigation">
                  <li><a href="${basePath}index.html">Home</a></li>
                  <li><a href="${basePath}pages/courses.html">Courses</a></li>

                  <li>
                    <a href="#">Pages <i class="ti-angle-down"></i></a>
                    <ul class="submenu">
                      <li><a href="${basePath}pages/course_details.html">Course Details</a></li>
                      <li><a href="${basePath}pages/elements.html">Elements</a></li>
                    </ul>
                  </li>

                  <li><a href="${basePath}pages/about.html">About</a></li>
                  <li><a href="${basePath}pages/contact.html">Contact</a></li>

                  ${userNav}
                </ul>
              </nav>
            </div>
          </div>

          <!-- Auth Area -->
          ${
            authSection
              ? `<div class="col-xl-3 col-lg-3 d-none d-lg-block">${authSection}</div>`
              : ""
          }

          <!-- Mobile -->
          <div class="col-12">
            <div class="mobile_menu d-block d-lg-none"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
</header>
`;
}
