import { db } from "@/db";
import { pets, user, walkers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { ScheduleForm } from "@/features/walks/components/schedule-form";

export default async function WalkerProfilePage({ params }: { params: Promise<{ walkerId: string }> }) {
  const { walkerId } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return null;

  // Busca o walker
  const walkerData = await db
    .select({
      id: walkers.id,
      bio: walkers.bio,
      pricePerWalk: walkers.pricePerWalk,
      rating: walkers.rating,
      experienceYears: walkers.experienceYears,
      name: user.name,
      image: user.image,
    })
    .from(walkers)
    .innerJoin(user, eq(walkers.userId, user.id))
    .where(eq(walkers.id, walkerId))
    .limit(1);

  if (walkerData.length === 0) {
    notFound();
  }

  const walker = walkerData[0];

  // Busca os pets do tutor para o select
  const myPets = await db.query.pets.findMany({
    where: eq(pets.ownerId, session.user.id),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="flex-1 w-full">
          <CardHeader className="flex flex-row gap-4 items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={walker.image || undefined} />
              <AvatarFallback className="text-2xl">{walker.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{walker.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-2 gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{(walker.rating! / 10).toFixed(1)}</span>
                <span className="mx-1">•</span>
                <span>{walker.experienceYears} anos de experiência</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Sobre mim</h3>
              <p className="text-muted-foreground">{walker.bio || "Nenhuma biografia fornecida."}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Valor por Passeio</h3>
              <p className="text-lg font-bold text-primary">
                R$ {(walker.pricePerWalk / 100).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-96">
          <CardHeader>
            <CardTitle>Agendar Passeio</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleForm walkerId={walker.id} pets={myPets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
