// // "use client"

// // import Link from "next/link"
// // import { usePathname } from "next/navigation"
// // import { Button } from "@/components/ui/button"
// // import { cn } from "@/lib/utils"
// // import {
// //   LayoutDashboard,
// //   FolderOpen,
// //   Wand2,
// //   Settings,
// //   HelpCircle,
// //   MessageSquare,
// //   Image,
// //   Video,
// //   Layers,
// // } from "lucide-react"

// // const sidebarItems = [
// //   {
// //     title: "Dashboard",
// //     href: "/dashboard",
// //     icon: <LayoutDashboard className="h-5 w-5" />,
// //   },
// //   {
// //     title: "Projects",
// //     href: "/dashboard/projects",
// //     icon: <FolderOpen className="h-5 w-5" />,
// //   },
// //   {
// //     title: "AI Tools",
// //     href: "/tools",
// //     icon: <Wand2 className="h-5 w-5" />,
// //     submenu: [
// //       {
// //         title: "Text & Speech",
// //         href: "/dashboard/tools/text-speech",
// //         icon: <MessageSquare className="h-5 w-5" />,
// //       },
// //       {
// //         title: "Image Generation",
// //         href: "/dashboard/tools/image",
// //         icon: <Image className="h-5 w-5" />,
// //       },
// //       {
// //         title: "Video Creation",
// //         href: "/dashboard/tools/video",
// //         icon: <Video className="h-5 w-5" />,
// //       },
// //       {
// //         title: "Animation Pipeline",
// //         href: "/dashboard/tools/animation",
// //         icon: <Layers className="h-5 w-5" />,
// //       },
// //     ],
// //   },
// //   {
// //     title: "Settings",
// //     href: "/dashboard/settings",
// //     icon: <Settings className="h-5 w-5" />,
// //   },
// //   {
// //     title: "Help & Support",
// //     href: "/dashboard/help",
// //     icon: <HelpCircle className="h-5 w-5" />,
// //   },
// // ]

// // export function Sidebar() {
// //   const pathname = usePathname()

// //   return (
// //     <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/95">
// //       <div className="flex flex-col gap-2 p-4">
// //         {sidebarItems.map((item, index) => {
// //           const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

// //           return (
// //             <div key={index} className="space-y-1">
// //               <Link href={item.href}>
// //                 <Button variant="ghost" className={cn("w-full justify-start gap-2", isActive && "bg-muted")}>
// //                   {item.icon}
// //                   {item.title}
// //                 </Button>
// //               </Link>

// //               {item.submenu && isActive && (
// //                 <div className="ml-6 space-y-1">
// //                   {item.submenu.map((subitem, subindex) => {
// //                     const isSubActive = pathname === subitem.href

// //                     return (
// //                       <Link key={subindex} href={subitem.href}>
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           className={cn("w-full justify-start gap-2", isSubActive && "bg-muted")}
// //                         >
// //                           {subitem.icon}
// //                           {subitem.title}
// //                         </Button>
// //                       </Link>
// //                     )
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           )
// //         })}
// //       </div>
// //     </aside>
// //   )
// // }



// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import {
//   LayoutDashboard,
//   FolderOpen,
//   Wand2,
//   Settings,
//   HelpCircle,
//   MessageSquare,
//   Image,
//   Video,
//   Layers,
//   ChevronDown,
// } from "lucide-react";

// const sidebarItems = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//     icon: <LayoutDashboard className="h-5 w-5" />,
//   },
//   {
//     title: "Projects",
//     href: "/dashboard/projects",
//     icon: <FolderOpen className="h-5 w-5" />,
//   },
//   {
//     title: "AI Tools",
//     icon: <Wand2 className="h-5 w-5" />,
//     submenu: [
//       {
//         title: "Text & Speech",
//         href: "/tools/text-to-speech",
//         icon: <MessageSquare className="h-5 w-5" />,
//       },
//       {
//         title: "Image Generation",
//         href: "/tools/text-to-image",
//         icon: <Image className="h-5 w-5" />,
//       },
//       {
//         title: "Video Creation",
//         href: "/tools/image-to-video",
//         icon: <Video className="h-5 w-5" />,
//       },
//       {
//         title: "Speech to Text",
//         href: "/tools/speech-to-text",
//         icon: <MessageSquare className="h-5 w-5" />,
//       },
//     ],
//   },
//   {
//     title: "Settings",
//     href: "/dashboard/settings",
//     icon: <Settings className="h-5 w-5" />,
//   },
//   {
//     title: "Help & Support",
//     href: "/dashboard/help",
//     icon: <HelpCircle className="h-5 w-5" />,
//   },
// ];

// export function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [openMenu, setOpenMenu] = useState<number | null>(null);

//   return (
//     <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/95">
//       <div className="flex flex-col gap-2 p-4">
//         {sidebarItems.map((item, index) => {
//           // Check if this item or any of its submenus are active
//           const isActive = item.href
//             ? pathname.startsWith(item.href)
//             : item.submenu?.some((sub) => pathname.startsWith(sub.href));

//           const isSubmenuOpen = openMenu === index;

//           return (
//             <div key={index} className="space-y-1">
//               {item.submenu ? (
//                 <Button
//                   variant="ghost"
//                   className={cn("w-full justify-start gap-2", isActive && "bg-muted")}
//                   onClick={() => setOpenMenu(isSubmenuOpen ? null : index)}
//                 >
//                   {item.icon}
//                   {item.title}
//                   <ChevronDown
//                     className={cn(
//                       "ml-auto h-4 w-4 transition-transform",
//                       isSubmenuOpen ? "rotate-180" : ""
//                     )}
//                   />
//                 </Button>
//               ) : (
//                 <Link href={item.href}>
//                   <Button variant="ghost" className={cn("w-full justify-start gap-2", isActive && "bg-muted")}>
//                     {item.icon}
//                     {item.title}
//                   </Button>
//                 </Link>
//               )}

//               {/* Submenu items */}
//               {item.submenu && isSubmenuOpen && (
//                 <div className="ml-6 space-y-1">
//                   {item.submenu.map((subitem, subindex) => {
//                     const isSubActive = pathname.startsWith(subitem.href);

//                     return (
//                       <Button
//                         key={subindex}
//                         variant="ghost"
//                         size="sm"
//                         className={cn("w-full justify-start gap-2", isSubActive && "bg-muted")}
//                         onClick={() => {
//                           router.push(subitem.href);
//                           setOpenMenu(null); // Close submenu
//                         }}
//                       >
//                         {subitem.icon}
//                         {subitem.title}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </aside>
//   );
// }

