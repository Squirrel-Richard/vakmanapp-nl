export const dynamic = 'force-dynamic'
import AppNav from '@/components/shared/AppNav'
import WebGLBackground from '@/components/shared/WebGLBackground'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 relative z-10 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}
