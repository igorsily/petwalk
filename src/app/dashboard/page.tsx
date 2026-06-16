import { auth } from "@/lib/auth";
import { db } from "@/db";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, CalendarDays, Star } from "lucide-react";
import { eq, and, gte, count } from "drizzle-orm";
import { pets, walks, reviews, walkers } from "@/db/schema";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return null;
  const role = session.user.role;

  // Variáveis para Tutor
  let totalPets = 0;
  let upcomingWalks = 0;
  let totalReviewsGiven = 0;

  // Variáveis para Walker
  let walksCompleted = 0;
  let walkerRating = "0.0";
  let totalReviewsReceived = 0;

  if (role === 'tutor') {
    const petsData = await db.select({ count: count() }).from(pets).where(eq(pets.ownerId, session.user.id));
    totalPets = petsData[0].count;

    const walksData = await db.select({ count: count() }).from(walks)
      .where(and(eq(walks.ownerId, session.user.id), eq(walks.status, 'accepted')));
    upcomingWalks = walksData[0].count;

    const reviewsData = await db.select({ count: count() }).from(reviews).where(eq(reviews.ownerId, session.user.id));
    totalReviewsGiven = reviewsData[0].count;
  } else if (role === 'walker') {
    const walkerProfile = await db.query.walkers.findFirst({
      where: eq(walkers.userId, session.user.id)
    });
    if (walkerProfile) {
      walkerRating = (walkerProfile.rating! / 10).toFixed(1);
      
      const walksData = await db.select({ count: count() }).from(walks)
        .where(and(eq(walks.walkerId, walkerProfile.id), eq(walks.status, 'completed')));
      walksCompleted = walksData[0].count;

      const reviewsData = await db.select({ count: count() }).from(reviews).where(eq(reviews.walkerId, walkerProfile.id));
      totalReviewsReceived = reviewsData[0].count;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {session.user.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta ao PetWalk.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {role === 'tutor' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Pets</CardTitle>
                <Dog className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPets}</div>
                <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Passeios Agendados</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingWalks}</div>
                <p className="text-xs text-muted-foreground">Aceitos e aguardando</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliações dadas</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReviewsGiven}</div>
                <p className="text-xs text-muted-foreground">Aos passeadores</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'walker' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Passeios Realizados</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{walksCompleted}</div>
                <p className="text-xs text-muted-foreground">Historicamente</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{walkerRating}</div>
                <p className="text-xs text-muted-foreground">Baseado em {totalReviewsReceived} reviews</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
