// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { FileText, Image, Video, Clock } from "lucide-react"

// export function DashboardStats() {
//   const stats = [
//     {
//       title: "Total Projects",
//       value: "12",
//       icon: <FileText className="h-5 w-5 text-muted-foreground" />,
//       change: "+2 this week",
//     },
//     {
//       title: "Images Generated",
//       value: "48",
//       icon: <Image className="h-5 w-5 text-muted-foreground" />,
//       change: "+15 this week",
//     },
//     {
//       title: "Videos Created",
//       value: "7",
//       icon: <Video className="h-5 w-5 text-muted-foreground" />,
//       change: "+3 this week",
//     },
//     {
//       title: "Usage Time",
//       value: "14h",
//       icon: <Clock className="h-5 w-5 text-muted-foreground" />,
//       change: "5h this week",
//     },
//   ]

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {stats.map((stat, index) => (
//         <Card key={index}>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
//             {stat.icon}
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stat.value}</div>
//             <p className="text-xs text-muted-foreground">{stat.change}</p>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }

