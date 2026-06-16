import { db } from "@/db";
import { pets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog } from "lucide-react";
import { PetFormDialog } from "@/features/pets/components/pet-form-dialog";

export default async function PetsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return null;

  const myPets = await db.query.pets.findMany({
    where: eq(pets.ownerId, session.user.id),
    orderBy: (pets, { desc }) => [desc(pets.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pets</h1>
          <p className="text-muted-foreground">
            Gerencie seus cachorros cadastrados na plataforma.
          </p>
        </div>
        <PetFormDialog />
      </div>

      {myPets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed">
          <Dog className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-semibold">Nenhum pet encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Você ainda não cadastrou nenhum pet. Adicione um para começar a agendar passeios.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              {pet.photoUrl && (
                <div className="w-full h-48 bg-muted">
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Raça: {pet.breed || 'Não informada'}</p>
                  <p>Idade: {pet.age ? `${pet.age} anos` : 'Não informada'}</p>
                  <p>Peso: {pet.weight ? `${pet.weight} kg` : 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
