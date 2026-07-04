# UI Analysis Document - Community App Frontend

## 1. Color Palette
- **Primary color:** `#A32328` (Defined as `--theme-color` CSS variable)
- **Secondary / Light Theme:** `#A3232820` (Primary color with 20% opacity, used for backgrounds/highlights)
- **Background colors:** White (`bg-white`) for the main body and sidebar menu area.
- **Text colors:** Black (`text-black`), `#788288` (Placeholder/Secondary text), `#9ea3ae` (Footer link text), White (in primary buttons and headers).
- **Border colors:** `#A32328` (Inputs border when focused/active), Black (`border-black` used in custom overrides).

## 2. Typography
- **Font family used:** Standard sans-serif (Tailwind default). No external Google Fonts were imported in `index.html`.
- **Heading sizes:** Up to `text-[16px]` and `text-lg` in the sidebar headers, some larger headings in dashboard likely relying on default Tailwind sizes like `text-xl`.
- **Body text sizes:** Mostly `text-sm` and `text-base` (e.g., `md:text-base` for inputs).
- **Font weights:** `font-medium`, `font-semibold`, `font-bold` used to emphasize headers and active items.

## 3. Layout Structure
- **Overall app layout:** A mobile-first/responsive design featuring a hidden off-canvas Sidebar (Slide-in from left) and a main content area (`DashboardLayout`).
- **Sidebar dimensions:** `w-72` (288 pixels wide), spanning full height (`h-full` / `100vh`).
- **Header/topbar structure:** Rendered per page via custom layouts (e.g., `LogoHeader` in Auth).
- **Content area padding/margins:** General padding applied via Tailwind utility classes (e.g., `p-4`, `p-8`) across components.

## 4. Sidebar Design
- **Position:** Left (`fixed top-0 left-0`). Slide-in animation (`-translate-x-full` to `translate-x-0`).
- **Width:** 288px (`w-72`).
- **Background color:** 
  - Header (User Profile): Theme color (`#A32328`) with white text.
  - Menu Items Area: White background (`bg-white`) with black text.
- **Menu items with icons list:**
  - Settings (Icon: `FaCog`, Route: Opens LanguagePopup)
  - Privacy (Icon: `MdOutlineSecurity`, Route: `/privacy-policy`)
  - Terms & Condition (Icon: `FaClipboardList`, Route: `/tems-condition`)
  - Helpline Call (Icon: `FaPhoneAlt`, Route: `/app-helpline`)
  - Delete My Account (Icon: `MdDelete`, Route: Opens DeletePopup)
  - Log Out (Icon: `FaSignOutAlt`, Route: Opens LogoutPopup)
  - *(Commented out items: Member List, Family Office, Committee, Find Member, Snehmilan Photo)*
- **Active / Hover state styling:** `hover:bg-gray-100` and `cursor-pointer`.
- **Logo/branding position:** The user profile picture (or `FaUser` icon) acts as the primary visual at the top of the sidebar.

## 5. Login Page Design
- **Layout:** Mobile-friendly, centered layout (`w-full max-w-md px-4`) wrapped in `AuthLayout`.
- **Form fields styling:** Custom `MobileInputField`. Text inputs use `border-[1.5px] border-black rounded-md text-sm shadow-md outline-none`. When focused, borders shift to theme color.
- **Button styling:** Primary buttons use `bg-theme border border-theme px-4 py-2 rounded text-white`.
- **Background style:** A specific `AuthLayout` wrapper.
- **Branding:** Uses `LogoHeader` which renders the community logo.

## 6. Dashboard Design
- **Structure:** Uses a wrapping `DashboardLayout` component.
- **Components included:** `DashboardCarousel` at the top, followed by `DashboardItems` (a grid of features). Includes an `Appversion` checker and an `AppUpdatePopup`.

## 7. Component Patterns
- **Button styles:** Base Tailwind `@apply bg-theme border border-theme px-4 py-2 rounded hover:bg-theme hover:text-white transition`.
- **Form input styles:** Outlined style with `border-black` and rounded corners. Placeholders are dark gray (`#555` or `#788288`).
- **Modals/Dialogs:** Ant Design (`.ant-modal`) is used, with CSS overrides to position it centrally.
- **Loaders:** Custom `CircularArcLoader` and customized Ant Design spin (`.custom-spin .ant-spin-dot-item`).

## 8. Icons Used
- **Icon library:** `react-icons/fa` (FontAwesome) and `react-icons/md` (Material Design).
- **List of common icons:** `FaUser`, `FaCog`, `FaSignOutAlt`, `FaClipboardList`, `FaEdit`, `FaPhoneAlt`, `MdDelete`, `MdOutlineSecurity`.

## 9. Screenshots Description
- **Login Page:** A clean, mobile-first centered column. At the top, a logo header and language switcher. Below, a prominent mobile number input field with a solid primary-colored submit button. Includes a "Register" link and footer text for policies.
- **Sidebar:** A sliding drawer from the left. The top section is a solid red (`#A32328`) block featuring the user's avatar and name. The bottom section is a white scrollable list of menu items with gray hover effects and red icons.
- **Dashboard:** Features an image carousel at the top, followed by a grid of actionable items.

## 10. Notable Design Elements
- **Animations used:** Slide-in transition for the sidebar (`transition-all duration-300`). Blinking animation (`animate-blink`) for specific badges/alerts.
- **Special effects:** Drop shadows on inputs (`shadow-md`).
- **Component Libraries:** The app heavily integrates **Ant Design** (evidenced by overrides for `.ant-picker`, `.ant-modal`, `.ant-badge`, `.ant-spin-dot-item`) alongside Tailwind CSS.

---

### Brand Elements
- **App Name:** Umarala Gam Samast Leuva Patel Samaj
- **Logo Paths:** 
  - `src/assets/img/community.png`
  - `public/community.svg`
- **Primary Brand Color:** `#A32328`
