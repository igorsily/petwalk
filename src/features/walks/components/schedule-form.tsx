"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scheduleWalkAction } from "@/features/walks/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ScheduleForm({ walkerId, pets }: { walkerId: string, pets: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("walkerId", walkerId);

    const result = await scheduleWalkAction(formData);
    
    setLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Passeio agendado com sucesso!");
      router.push("/dashboard");
    }
  };

  if (pets.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Você precisa cadastrar um pet antes de agendar um passeio.
        <Button variant="link" onClick={() => router.push("/dashboard/pets")} className="w-full mt-2">
          Cadastrar Pet
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="petId">Selecione o Pet</Label>
        <Select name="petId" required>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um pet..." />
          </SelectTrigger>
          <SelectContent>
            {pets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="scheduledDate">Data e Hora</Label>
        <Input 
          id="scheduledDate" 
          name="scheduledDate" 
          type="datetime-local" 
          required 
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationMinutes">Duração (minutos)</Label>
        <Select name="durationMinutes" defaultValue="30">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutos</SelectItem>
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="45">45 minutos</SelectItem>
            <SelectItem value="60">1 hora</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Agendando..." : "Confirmar Agendamento"}
      </Button>
    </form>
  );
}
