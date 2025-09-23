
"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const data = await response.json();
        setIsAuthenticated(data.isLoggedIn); // Check if the user is authenticated
      } catch (error) {
        console.error("Failed to check authentication", error);
      }
    };

    checkAuth();
  }, []);

  // Set navItems based on authentication status
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Pricing", path: "/pricing" },
    { name: "Platform Gallery", path: "/Platformgallery" },

  ];

  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
              Pixie-Talk
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            // Show user profile or logout button if authenticated
            <Link href="/profile">
              <Button size="sm">Profile</Button>
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" aria-label="Toggle Menu" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="container py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Profile</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}



//navbar.tsx



// "use client"

// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ModeToggle } from "@/components/mode-toggle";
// import { Menu, X } from "lucide-react";

// export function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const pathname = usePathname();

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/auth/status");
//         const data = await response.json();
//         setIsAuthenticated(data.isLoggedIn); // Check if the user is authenticated
//       } catch (error) {
//         console.error("Failed to check authentication", error);
//       }
//     };

//     checkAuth();
//   }, []);

//   // Set navItems based on authentication status
//   const navItems = [
//     { name: "Home", path: "/" },
//     { name: "Tools", path: "/tools" },
//     { name: "Pricing", path: "/pricing" },
//     { name: "Platform Gallery", path: "/Platformgallery" }
//   ];

  

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container flex h-16 items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Link href="/" className="flex items-center gap-2">
//             <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
//              Pixie Talk
//             </span>
//           </Link>
//         </div>

//         <nav className="hidden md:flex items-center gap-6">
//           {navItems.map((item) => (
//             <Link
//               key={item.path}
//               href={item.path}
//               className={`text-sm font-medium transition-colors hover:text-primary ${
//                 pathname === item.path ? "text-primary" : "text-muted-foreground"
//               }`}
//             >
//               {item.name}
//             </Link>
//           ))}
//         </nav>

//         <div className="hidden md:flex items-center gap-4">
//           <ModeToggle />
//           {!isAuthenticated ? (
//             <>
//               <Link href="/login">
//                 <Button variant="outline" size="sm">
//                   Login
//                 </Button>
//               </Link>
//               <Link href="/register">
//                 <Button size="sm">Sign Up</Button>
//               </Link>
//             </>
//           ) : (
//             // Show user profile or logout button if authenticated
//             <Link href="/profile">
//               <Button size="sm">Profile</Button>
//             </Link>
//           )}
//         </div>

//         <div className="flex md:hidden items-center gap-4">
//           <ModeToggle />
//           <Button variant="ghost" size="icon" aria-label="Toggle Menu" onClick={toggleMenu}>
//             {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </Button>
//         </div>
//       </div>

//       {isMenuOpen && (
//         <div className="md:hidden border-t border-border/40">
//           <div className="container py-4 flex flex-col gap-4">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 className={`text-sm font-medium transition-colors hover:text-primary ${
//                   pathname === item.path ? "text-primary" : "text-muted-foreground"
//                 }`}
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 {item.name}
//               </Link>
//             ))}
//             <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
//               {!isAuthenticated ? (
//                 <>
//                   <Link href="/login" onClick={() => setIsMenuOpen(false)}>
//                     <Button variant="outline" className="w-full">
//                       Login
//                     </Button>
//                   </Link>
//                   <Link href="/register" onClick={() => setIsMenuOpen(false)}>
//                     <Button className="w-full">Sign Up</Button>
//                   </Link>
//                 </>
//               ) : (
//                 <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
//                   <Button className="w-full">Profile</Button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }

