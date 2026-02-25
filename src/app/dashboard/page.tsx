import { AdminSidebar } from "@/components/admin/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Eye, TrendingUp } from "lucide-react"
import { db } from "@/lib/db"
import { chapters, users } from "@/db/schema"

export default async function DashboardPage() {
  // Fetch statistics
  const totalMateri = await db.$count(chapters);
  const totalUsers = await db.$count(users);
  
  // Mock statistics for now
  const stats = [
    {
      title: "Total Materi",
      value: totalMateri.toString(),
      description: "Materi sejarah aktif",
      icon: BookOpen,
    },
    {
      title: "Total Pengguna",
      value: totalUsers.toString(),
      description: "Guru dan Admin terdaftar",
      icon: Users,
    },
    {
      title: "Total Kunjungan",
      value: "1,234",
      description: "Bulan ini",
      icon: Eye,
    },
    {
      title: "Engagement",
      value: "+12%",
      description: "Peningkatan dari bulan lalu",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar className="hidden md:block" />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-amber-500">Dashboard Statistik</h2>
            <p className="text-muted-foreground">
              Ringkasan aktivitas dan konten museum digital.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
