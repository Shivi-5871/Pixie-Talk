// "use client";

// import { useEffect, useState } from "react";
// import { DashboardHeader } from "@/components/dashboard/header";
// import { Navbar } from "@/components/navbar";

// export function HeaderSwitcher() {
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const res = await fetch("/api/auth/session", {
//           method: "GET",
//           credentials: "include",
//         });

//         if (res.ok) {
//           const data = await res.json();
//           setIsLoggedIn(!!data?.user);
//         } else {
//           setIsLoggedIn(false);
//         }
//       } catch (err) {
//         console.error("Failed to fetch session:", err);
//         setIsLoggedIn(false);
//       }
//     };

//     checkSession();
//   }, []);

//   if (isLoggedIn === null) return null; // Optionally render a spinner

//   return isLoggedIn ? (
//     <DashboardHeader setIsLoggedIn={(v) => setIsLoggedIn(typeof v === "function" ? v(true) : v)} />
//   ) : (
//     <Navbar />
//   );
  
// }
