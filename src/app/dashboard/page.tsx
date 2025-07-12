import { getUser } from '@/src/lib/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              Welcome to Echo
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Keep the memories alive through voice conversations with those who have passed.
            </p>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Select a person from the sidebar to start a conversation, or create a new person to begin preserving their memory.
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link href="/dashboard/create-person">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Person
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}