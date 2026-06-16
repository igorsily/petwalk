"use server";

import { db } from "@/db";
import { walks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function scheduleWalkAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user || session.user.role !== 'tutor') {
      return { error: "Não autorizado" };
    }

    const petId = formData.get("petId") as string;
    const walkerId = formData.get("walkerId") as string;
    const scheduledDate = new Date(formData.get("scheduledDate") as string);
    const durationMinutes = parseInt(formData.get("durationMinutes") as string, 10);

    await db.insert(walks).values({
      ownerId: session.user.id,
      petId,
      walkerId,
      scheduledDate,
      durationMinutes,
      status: "pending",
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao agendar passeio" };
  }
}

export async function updateWalkStatusAction(walkId: string, newStatus: 'accepted' | 'rejected' | 'completed' | 'cancelled') {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { error: "Não autorizado" };
    }

    // Validação extra poderia verificar se o usuário é o dono do walk ou o passeador associado
    await db.update(walks)
      .set({ status: newStatus })
      .where(eq(walks.id, walkId));

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar status" };
  }
}
