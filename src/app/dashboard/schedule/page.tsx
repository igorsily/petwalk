import { db } from "@/db";
import { walks, pets, user, walkers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WalkStatusButtons } from "@/features/walks/components/walk-status-buttons";
import { redirect } from "next/navigation";

export default async function WalkerSchedulePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'walker') {
    redirect("/dashboard");
  }

  const walkerProfile = await db.query.walkers.findFirst({
    where: eq(walkers.userId, session.user.id),
  });

  if (!walkerProfile) {
    return <div>Perfil de passeador não encontrado.</div>;
  }

  // Busca passeios agendados para este passeador
  const scheduledWalks = await db
    .select({
      id: walks.id,
      status: walks.status,
      scheduledDate: walks.scheduledDate,
      durationMinutes: walks.durationMinutes,
      petName: pets.name,
      ownerName: user.name,
    })
    .from(walks)
    .innerJoin(pets, eq(walks.petId, pets.id))
    .innerJoin(user, eq(walks.ownerId, user.id))
    .where(eq(walks.walkerId, walkerProfile.id))
    .orderBy(desc(walks.scheduledDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus passeios agendados e aceite novas solicitações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scheduledWalks.length === 0 ? (
          <div className="col-span-full p-8 text-center border-dashed border-2 rounded-lg text-muted-foreground">
            Você ainda não tem solicitações de passeio.
          </div>
        ) : (
          scheduledWalks.map((walk) => (
            <Card key={walk.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{walk.petName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    walk.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                    walk.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                    walk.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                  }`}>
                    {walk.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1">
                <p className="text-sm"><strong>Tutor:</strong> {walk.ownerName}</p>
                <p className="text-sm"><strong>Data:</strong> {new Date(walk.scheduledDate).toLocaleString()}</p>
                <p className="text-sm"><strong>Duração:</strong> {walk.durationMinutes} minutos</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <WalkStatusButtons walkId={walk.id} currentStatus={walk.status} />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
