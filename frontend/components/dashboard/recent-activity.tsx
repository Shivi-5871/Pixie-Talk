// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { MessageSquare, Image, Video, Clock } from "lucide-react"

// export function RecentActivity() {
//   const activities = [
//     {
//       id: 1,
//       action: "Generated 5 images",
//       project: "Marketing Campaign",
//       time: "2 hours ago",
//       icon: <Image className="h-4 w-4" />,
//     },
//     {
//       id: 2,
//       action: "Created a new video",
//       project: "Product Explainer",
//       time: "Yesterday",
//       icon: <Video className="h-4 w-4" />,
//     },
//     {
//       id: 3,
//       action: "Transcribed audio",
//       project: "Podcast Episode",
//       time: "2 days ago",
//       icon: <MessageSquare className="h-4 w-4" />,
//     },
//     {
//       id: 4,
//       action: "Updated project",
//       project: "Animation Pipeline",
//       time: "3 days ago",
//       icon: <Clock className="h-4 w-4" />,
//     },
//   ]

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Recent Activity</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {activities.map((activity) => (
//             <div key={activity.id} className="flex items-center gap-4 rounded-lg border p-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">{activity.icon}</div>
//               <div className="flex-1 space-y-1">
//                 <p className="text-sm font-medium">{activity.action}</p>
//                 <p className="text-xs text-muted-foreground">{activity.project}</p>
//               </div>
//               <div className="text-xs text-muted-foreground">{activity.time}</div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

