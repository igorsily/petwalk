import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Dog, CalendarDays, Search } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-muted/40 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 font-bold text-xl px-2">
          🐾 PetWalk
        </div>
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-4 w-4" /> Início
            </Button>
          </Link>
          
          {role === 'tutor' && (
            <>
              <Link href="/dashboard/pets">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Dog className="h-4 w-4" /> Meus Pets
                </Button>
              </Link>
              <Link href="/dashboard/search">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Search className="h-4 w-4" /> Encontrar Passeador
                </Button>
              </Link>
              <Link href="/dashboard/walks">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CalendarDays className="h-4 w-4" /> Meus Passeios
                </Button>
              </Link>
            </>
          )}

          {role === 'walker' && (
            <Link href="/dashboard/schedule">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <CalendarDays className="h-4 w-4" /> Minha Agenda
              </Button>
            </Link>
          )}
        </nav>
        
        <div className="mt-auto border-t pt-4 px-2 flex flex-col gap-4">
          <div className="text-sm">
            <p className="font-semibold">{session.user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
