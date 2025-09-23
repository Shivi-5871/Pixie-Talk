// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Edit, Trash2, ExternalLink } from "lucide-react"

// export function ProjectGrid() {
//   const projects = [
//     {
//       id: 1,
//       title: "Product Explainer Video",
//       type: "Animation",
//       thumbnail: "/placeholder.svg?height=200&width=300",
//       date: "2 days ago",
//     },
//     {
//       id: 2,
//       title: "Marketing Campaign Images",
//       type: "Image Generation",
//       thumbnail: "/placeholder.svg?height=200&width=300",
//       date: "1 week ago",
//     },
//     {
//       id: 3,
//       title: "Podcast Transcription",
//       type: "Speech to Text",
//       thumbnail: "/placeholder.svg?height=200&width=300",
//       date: "2 weeks ago",
//     },
//   ]

//   return (
//     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//       {projects.map((project) => (
//         <Card key={project.id} className="overflow-hidden">
//           <div className="aspect-video relative overflow-hidden">
//             <img
//               src={project.thumbnail || "/placeholder.svg"}
//               alt={project.title}
//               className="object-cover w-full h-full transition-transform hover:scale-105"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
//             <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
//               <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{project.type}</span>
//               <span className="text-xs text-muted-foreground">{project.date}</span>
//             </div>
//           </div>
//           <CardContent className="p-4">
//             <h3 className="font-semibold truncate">{project.title}</h3>
//           </CardContent>
//           <CardFooter className="p-4 pt-0 flex justify-between gap-2">
//             <Button variant="outline" size="sm" className="w-full gap-1">
//               <Edit className="h-4 w-4" />
//               Edit
//             </Button>
//             <Button variant="outline" size="sm" className="w-8 p-0">
//               <Trash2 className="h-4 w-4" />
//             </Button>
//             <Button variant="outline" size="sm" className="w-8 p-0">
//               <ExternalLink className="h-4 w-4" />
//             </Button>
//           </CardFooter>
//         </Card>
//       ))}
//     </div>
//   )
// }

