# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2023-11-03

### Added
- **Identity Verification System:**
  - Implemented a comprehensive, multi-step verification flow enabling users to submit personal information, ID documents (via upload or camera), and debit card details.
  - Added a new `VerificationFlow.tsx` component with four distinct steps to guide the user.
- **Admin Verification Panel:**
  - Introduced a "Verification Requests" queue in the `AdminPanel`.
  - Created a `VerificationReviewModal.tsx` allowing administrators to securely view all submitted data and approve or reject user submissions.
- **User Notification System:**
  - Added a `NotificationBell.tsx` to the main header, providing users with real-time updates on their account status.
  - Users now receive notifications for events like verification approval or rejection.
- **Conditional Withdrawals:**
  - The Wallet (`Wallet.tsx`) now intelligently checks a user's verification status, gating the withdrawal feature until the user is verified.
  - Unverified users are shown a clear prompt to start the verification process.

### Changed
- **State Management:** `AuthContext.tsx` was significantly expanded to manage the entire verification lifecycle (`submitVerification`, `approveVerification`, `rejectVerification`) and the new notification system (`addNotification`, `markAllNotificationsAsRead`).
- **Data Models:** Updated `types.ts` to include new interfaces for `VerificationData` and `Notification`, and expanded the `User` model to include `verificationStatus` and `notifications`.
- **Account Page:** The `AccountPage.tsx` now displays the user's current verification status and provides a clear call-to-action to begin verification if needed.

### Fixed
- **Build Errors:** Resolved critical build failures caused by an incorrect import path in `AccountPage.tsx` and invalid JSX syntax (`stroke-linecap`) in SVG icon definitions within `constants.tsx`, restoring application functionality.

## [2.5.0] - 2023-11-02

### Added
- **Multi-Channel Support System:**
  - Implemented a complete **Live Chat** feature allowing real-time communication between users and administrators.
  - A new floating "Live Support" icon is now available application-wide, including on the public landing page.
  - For unauthenticated visitors, the Live Support icon now intelligently opens the login/signup modal.
  - Added a **Live Chat Support** module to the Admin Panel, allowing admins to manage multiple user conversations, receive notifications, and reply directly.
- **"Contact Us" Section:** Added a comprehensive "Get In Touch" section to the landing page footer, with a contact form and detailed contact information.
- **Persistent Floating Chat Icons:** The AI Assistant and Live Support floating action buttons are now consistently available on the public landing page for all visitors.

### Changed
- **Notification Position:** Relocated the "Live Profit" notifications from the bottom-left to the top-right of the screen to prevent overlap with the new floating support icons.
- **State Management:** Extended `AuthContext` to manage live chat sessions and messages, including read/unread status for both users and admins.

### Fixed
- **Critical Render Loop:** Resolved application-crashing infinite render loops within the `LiveChat` component and `AuthContext` by correcting state update logic, significantly improving overall application stability.

## [2.4.0] - 2023-11-01

### Added
- **Live Interactive Mobile Demo:** Implemented a sophisticated, animated mobile dashboard mockup on the landing page. It features a realistic SVG pointer that simulates user interaction, a slide-out navigation menu, and dynamic content such as multiple asset balances, an animated sparkline chart, and a sequential activity feed.
- **AI Profit Forecaster:** Added an interactive module to the landing page where visitors can drag a slider to simulate an investment amount and view projected returns on a live-updating chart.

### Changed
- **Complete Landing Page Overhaul:** The landing page was entirely redesigned into a modern, professional, and highly interactive experience. This includes a new hero section with improved image clarity, themed imagery, advanced CSS animations, and an infinite-scrolling logo marquee for social proof.
- **Mobile Demo Realism:** The dashboard mockup within the animated mobile demo was expanded to show individual balances for BTC, USDT, and ETH, and the slide-out menu was populated with the full, accurate list of navigation items, providing a more realistic application preview.
- **UI Polish:** Enhanced micro-interactions across the landing page, including hover effects on feature cards and smooth scroll-triggered animations.

### Fixed
- **Hero Image Clarity:** Resolved issues with the hero section's background image visibility by adjusting the overlay opacity and applying a stronger text-shadow to ensure both the image and the headline text are clear and impactful.
- **Pointer Animation:** Replaced placeholder animations with a custom, high-fidelity SVG pointer in the mobile demo that precisely matches the requested style for a more authentic user interaction simulation.
- **Testimonial Scroller:** Corrected the logic for the infinite-scrolling testimonial component to ensure a smooth, seamless loop without any visual duplication or jitter.

## [2.3.0] - 2023-10-31

### Added
- **Comprehensive Profile Editing:** Users can now edit their username, phone number, country, and a personal bio. The "Edit Profile" modal allows for avatar changes via file upload or by taking a new photo with the device's camera (`CameraCapture.tsx`).
- **Secure Withdrawal Workflow:**
  - Implemented a secure, admin-approved withdrawal process. Requests are sent to a new "Withdrawal Requests" queue in the Admin Panel.
  - Submitting a withdrawal now creates an immediate "Pending" transaction in the user's history for full transparency.
- **Interactive Transaction Receipts:** The transaction history is now fully interactive. Each row is clickable, opening a detailed on-screen `TransactionReceiptModal` for any transaction.
- **Gamification & Engagement:**
  - Added an `InviteBonusModal` that appears after login to promote the new referral program.
  - Implemented a `loginStreak` feature, visually tracked in the header, to encourage daily user activity.
- **New Shared Components:**
  - `ConfirmationModal.tsx`: A reusable modal to confirm critical actions, starting with user logout.
  - `EditProfileModal.tsx`: A complete modal for all user profile customization.
  - `CameraCapture.tsx`: A component providing a live camera feed for taking profile pictures.
  - `TransactionReceiptModal.tsx`: A modal for displaying detailed transaction receipts.

### Changed
- **Verification Badge:** Replaced the old verification icon with a new, premium SVG that is properly sized and scaled on both the Dashboard and Account pages.
- **Landing Page Interactivity:** The main landing page is now fully functional. Navigation links in the header now smoothly scroll to their corresponding sections.
- **Transaction History Consistency:** The transaction history for the default user is now a large, static list, ensuring consistent and predictable data on every load.
- **Wallet UI:** The wallet now supports an expanded transaction history with a "See More" button.

### Fixed
- **Critical Withdrawal Form Bug:** Completely fixed the bug where the input cursor would disappear while typing in the withdrawal form. This was achieved by refactoring the form into its own `WithdrawalForm.tsx` component with isolated state management.
- **Profile Avatar Placeholder:** The placeholder for users without an avatar now correctly displays their initials.
- **Investment Logic:** Confirmed and verified that investing correctly deducts funds from the selected asset balance (BTC, ETH, or USDT).

## [2.2.0] - 2023-10-30

### Added
- **Advanced Trading Terminal:** Users can now switch between multiple trading pairs (`BTC/USDT`, `ETH/USDT`, `ETH/BTC`) and adjust chart timeframes (`1D`, `1W`, `1M`) for more detailed analysis.
- **Comprehensive User Management (Admin):** Admins can now view all registered users and their balances, and directly send funds (BTC, ETH, USDT) to any user account via a new `SendFundsModal`.
- **On-Screen Investment Receipt:** Implemented an immediate on-screen "Proof of Investment" receipt after a successful investment, with a direct "View in History" button for seamless navigation.

### Changed
- **Investment Balance Logic:** When a user invests, the specified amount is now correctly debited from the corresponding asset balance (BTC, USDT, or ETH), rather than a single default balance.
- **Profit Distribution Logic:** Fixed and verified the admin approval workflow. When an admin approves an investment return, the user's balance is now correctly credited with the **full potential return** (principal + profit).
- **Live Profit Notifications:** Enhanced the social proof engine by mixing in realistic, randomly generated names with the anonymous "Investor" tags and significantly increasing the notification pool for more variety.
- **New User Profile Pictures:** New users are no longer assigned a default avatar. They now display a clean, initial-based placeholder until they upload their own picture, improving the onboarding aesthetic.
- **Investment Modal UI:** The modal now provides instant feedback by displaying both the "Estimated Profit" and "Total Potential Return" in real-time as a user types in their investment amount.

## [2.1.0] - 2023-10-29

### Added
- **Investment History Page:** Created `InvestmentHistory.tsx` to provide users with a persistent, receipt-like record of all active crypto and alternative investments.
- **Multi-Asset Investment:** Users can now choose to invest with **BTC, USDT, or ETH**. The investment modal dynamically shows the available balance for the selected asset.
- **Live Profit Projections:** The `InvestmentModal` now calculates and displays an "Estimated Profit" in real-time as the user enters an investment amount.
- **Proof of Investment:** The investment success screen has been redesigned into a "Proof of Investment" receipt, confirming all transaction details.
- **Expanded Funding Options:** Added UI in the wallet for new funding methods including PayPal, Cash App, and Zelle.

### Changed
- **Trading Terminal:** The static candlestick chart has been upgraded to a **live-simulated chart** that generates and renders new price data every few seconds, creating a realistic trading environment.
- **Admin Panel:** Streamlined the admin experience by removing irrelevant user-centric pages (Trade, Invest, Portfolio) from the navigation, creating a focused management dashboard.
- **Investment Logic:**
    - Fixed a critical bug to ensure the admin account is correctly credited with user investment funds for all investment types (Crypto and Alternative).
    - All investments now create a permanent record in the new `InvestmentHistory` page.
- **Wallet & Funding:** Implemented more realistic logic for the "Bank Transfer" option, which now requires a $1,000 minimum and displays specific contact instructions to the user.
- **Social Proof & Engagement:**
    - Live profit notifications are now displayed on the public `LandingPage` for all visitors, not just logged-in users.
    - The pool of notification data was significantly expanded to avoid repetition and feel more authentic.
- **Default User Data:** The default user account ("Gerald") is now seeded with an extensive, multi-year transaction history for enhanced realism.
- **Landing Page:** Reordered content sections to create a more impactful and logical narrative for new visitors.

## [2.0.0] - 2023-10-28

### Added
- **Full Authentication System:**
  - Introduced a professional public `LandingPage` as the new entry point for the application.
  - Implemented a modal-based login and sign-up flow, replacing the previous dedicated login page.
  - Created a robust `AuthContext` to manage global application state, including user authentication, all user data, transactions, and balances.
  - Added specific user roles: a default user (`Gerald`), an `Admin` user, and functionality to sign up new users with zero balances.
- **New Core Pages & Layouts:**
  - Added `MainLayout.tsx` to serve as the primary structure for authenticated users, containing the sidebar, header, and main content area.
  - **Portfolio Page:** Created a new `Portfolio.tsx` page featuring an SVG pie chart for asset allocation and a detailed summary of user holdings.
  - **Alternative Investments Page:** Added `AlternativeInvestments.tsx`, a new investment vertical allowing users to invest in non-crypto assets like Tech, Green Energy, and Real Estate.
  - **Account Page:** `AccountPage.tsx` provides a detailed view of the user's profile and settings.
  - **Admin Panel:** Implemented `AdminPanel.tsx` where an admin can manage users, send notifications, and credit investment profits.
- **New Components & Features:**
  - **Interactive Investment Modals:** Added `InvestmentModal.tsx` to create a functional and interactive investment flow for both crypto and alternative investment plans.
  - **Account Funding:** The Wallet now includes a "Fund Account" tab with a `FundingModal.tsx` component to simulate deposits via Credit Card and Bank Transfer.
  - **Live Candlestick Chart:** Added a custom `CandlestickChart.tsx` component using SVG to provide a more realistic and professional trading chart.
  - **Professional Landing Page:** The `LandingPage.tsx` was significantly enhanced with multiple new sections (`How It Works`, `Security First`, `Testimonials`), integrated imagery with professional copy, and stronger calls-to-action.

### Changed
- **State Management:** Overhauled the application's state management. All user-specific data (balances, transactions, investments) is now managed centrally and dynamically within `AuthContext`, transforming the app from a static mock-up to a fully interactive simulation.
- **Investment Flow:** The "Invest" pages are now fully functional. Users can invest their balance, see it deducted in real-time, and receive simulated profits that are credited back to their account and recorded in their wallet.
- **Wallet Functionality:** The transaction history in `Wallet.tsx` is no longer static. It now dynamically displays a complete and accurate log of all financial activities (investments, profits, funding) managed through `AuthContext`.
- **Application Routing:** The root `App.tsx` component now acts as a high-level router, directing unauthenticated users to the `LandingPage` and authenticated users to the `MainLayout`.
- **Admin Panel:** The admin's ability to "send profit" is now fully functional, correctly updating the target user's balance and creating a corresponding transaction record.

## [1.0.0] - 2023-10-27

### Added
- **Initial Project Scaffolding:**
  - Set up a React v19 + TypeScript project.
  - Integrated Tailwind CSS for utility-first styling and a custom dark theme.
  - Configured ES module import maps for client-side dependency management.
- **Core Application Structure:**
  - Main `App.tsx` component with client-side routing for all primary pages.
  - Fully responsive layout featuring a desktop sidebar and a mobile bottom navigation bar.
  - Shared `Card` and `Icon` components to ensure UI consistency and reusability.
- **Dashboard (`Dashboard`):**
  - Dynamic welcome message and a display of the user's achievement badges.
  - Account summary cards for Total Balance (USD), Bitcoin, and USDT.
  - Social Proof Engine: "Verified Investors Leaderboard" and "Recent Big Cashouts" sections to build user trust.
  - User Engagement: "Set Your Goal" challenge card to encourage investment.
  - Platform transparency section with key statistics and "As Seen On" logos.
- **Trading Terminal (`Trade`):**
  - UI for a BTC/USDT trading pair, including a price chart placeholder.
  - Trading form supporting Market, Limit, and Stop orders.
  - Live Order Book and Trade History displays (populated with mock data).
- **Investment Plans (`Invest`):**
  - Display of four pre-set, color-coded investment plans (Starter, Pro, Institutional, Whale).
  - Placeholder for the AI Profit Forecaster chart.
- **Wallet (`Wallet`):**
  - Overview of user balances across BTC, USDT, and ETH.
  - Tabbed interface for Deposit and Withdraw actions.
  - A detailed Transaction History table with status badges.
- **AI-Powered Assistant:**
  - Integrated Google Gemini API (`gemini-2.5-flash`) for a state-of-the-art conversational AI.
  - A Floating Action Button (FAB) provides easy access to the assistant.
  - Implemented a full chat interface with support for streaming responses.
  - A dedicated `geminiService.ts` manages API communication.