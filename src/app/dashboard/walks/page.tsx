import { db } from "@/db";
import { walks, walkers, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function TutorWalksPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'tutor') {
    redirect("/dashboard");
  }

  // Busca passeios agendados pelo tutor
  const myWalks = await db
    .select({
      id: walks.id,
      status: walks.status,
      scheduledDate: walks.scheduledDate,
      durationMinutes: walks.durationMinutes,
      walkerName: user.name,
    })
    .from(walks)
    .innerJoin(walkers, eq(walks.walkerId, walkers.id))
    .innerJoin(user, eq(walkers.userId, user.id))
    .where(eq(walks.ownerId, session.user.id))
    .orderBy(desc(walks.scheduledDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Passeios</h1>
        <p className="text-muted-foreground">
          Acompanhe o status dos passeios solicitados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myWalks.length === 0 ? (
          <div className="col-span-full p-8 text-center border-dashed border-2 rounded-lg text-muted-foreground">
            Você ainda não solicitou nenhum passeio.
          </div>
        ) : (
          myWalks.map((walk) => (
            <Card key={walk.id}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Passeador: {walk.walkerName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    walk.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    walk.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    walk.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {walk.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Data:</strong> {new Date(walk.scheduledDate).toLocaleString()}</p>
                <p className="text-sm"><strong>Duração:</strong> {walk.durationMinutes} minutos</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
