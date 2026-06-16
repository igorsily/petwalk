"use server";

import { db } from "@/db";
import { pets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const petSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  breed: z.string().optional(),
  age: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function createPetAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    const data = {
      name: formData.get("name") || "",
      breed: formData.get("breed") || undefined,
      age: formData.get("age") || undefined,
      weight: formData.get("weight") || undefined,
      notes: formData.get("notes") || undefined,
      photoUrl: formData.get("photoUrl") || undefined,
    };

    const parsed = petSchema.safeParse(data);

    if (!parsed.success) {
      return { error: "Dados inválidos", details: parsed.error.flatten() };
    }

    await db.insert(pets).values({
      ownerId: session.user.id,
      name: parsed.data.name,
      breed: parsed.data.breed,
      age: parsed.data.age,
      weight: parsed.data.weight,
      notes: parsed.data.notes,
      photoUrl: parsed.data.photoUrl,
    });

    revalidatePath("/dashboard/pets");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro interno do servidor" };
  }
}
