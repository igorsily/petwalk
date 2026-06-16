import { db } from "@/db";
import { walkers, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import Link from "next/link";

export default async function SearchWalkersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return null;

  // Busca todos os passeadores com suas informações de usuário
  // Como Drizzle não tem relações definidas de forma explícita no arquivo sem rel schema, fazemos um join
  const availableWalkers = await db
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
    .where(eq(walkers.available, true))
    .orderBy(desc(walkers.rating));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Encontrar Passeador</h1>
        <p className="text-muted-foreground">
          Busque pelos melhores passeadores disponíveis na plataforma.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableWalkers.map((walker) => (
          <Card key={walker.id} className="flex flex-col">
            <CardHeader className="flex flex-row gap-4 items-start">
              <Avatar className="w-12 h-12">
                <AvatarImage src={walker.image || undefined} />
                <AvatarFallback>{walker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{walker.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{(walker.rating! / 10).toFixed(1)}</span>
                  <span className="mx-1">•</span>
                  <span>{walker.experienceYears} anos exp.</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {walker.bio || "Nenhuma biografia fornecida."}
              </p>
              <div className="mt-4 font-semibold">
                R$ {(walker.pricePerWalk / 100).toFixed(2).replace('.', ',')} / passeio
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/search/${walker.id}`} className="w-full">
                <Button className="w-full">Ver Perfil e Agendar</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {availableWalkers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum passeador disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
