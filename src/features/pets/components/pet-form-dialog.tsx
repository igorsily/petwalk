"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPetAction } from "@/features/pets/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function PetFormDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    if (photoBase64) {
      formData.set("photoUrl", photoBase64);
    }

    const result = await createPetAction(formData);
    
    setLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pet cadastrado com sucesso!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="w-4 h-4" /> Adicionar Pet
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Pet</DialogTitle>
            <DialogDescription>
              Adicione as informações do seu cachorro aqui. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Pet *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="breed">Raça</Label>
              <Input id="breed" name="breed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" name="age" type="number" min="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input id="weight" name="weight" type="number" min="0" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photo">Foto (Upload mockado via base64)</Label>
              <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
              {photoBase64 && (
                <div className="mt-2 h-20 w-20 overflow-hidden rounded-md border">
                  <img src={photoBase64} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
