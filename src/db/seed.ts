import "dotenv/config";
import { db } from "./index";
import { user, walkers } from "./schema";

async function main() {
  console.log("🌱 Executando seed...");

  // Criar passeadores mockados
  const mockWalkers = [
    {
      id: "walker-1",
      name: "Carlos Passeador",
      email: "carlos@passeador.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "walker",
    },
    {
      id: "walker-2",
      name: "Ana Silva",
      email: "ana@passeador.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "walker",
    }
  ];

  for (const w of mockWalkers) {
    await db.insert(user).values(w).onConflictDoNothing();
    
    await db.insert(walkers).values({
      userId: w.id,
      bio: `Olá, sou ${w.name} e adoro passear com cachorros!`,
      pricePerWalk: 4500, // R$ 45,00
      rating: 48, // 4.8
      experienceYears: 3,
      available: true,
    }).onConflictDoNothing();
  }

  console.log("✅ Seed finalizado!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Erro no seed:", e);
  process.exit(1);
});
