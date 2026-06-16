"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateWalkStatusAction } from "@/features/walks/actions";
import { toast } from "sonner";
import { Check, X, CheckCircle2 } from "lucide-react";

export function WalkStatusButtons({ walkId, currentStatus }: { walkId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: 'accepted' | 'rejected' | 'completed' | 'cancelled') => {
    setLoading(true);
    const result = await updateWalkStatusAction(walkId, status);
    setLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Status atualizado para ${status}!`);
    }
  };

  if (currentStatus === 'pending') {
    return (
      <>
        <Button 
          variant="default" 
          className="flex-1 bg-green-600 hover:bg-green-700" 
          onClick={() => handleUpdate('accepted')}
          disabled={loading}
        >
          <Check className="w-4 h-4 mr-2" /> Aceitar
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950" 
          onClick={() => handleUpdate('rejected')}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" /> Recusar
        </Button>
      </>
    );
  }

  if (currentStatus === 'accepted') {
    return (
      <Button 
        variant="default" 
        className="w-full" 
        onClick={() => handleUpdate('completed')}
        disabled={loading}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Concluído
      </Button>
    );
  }

  return null;
}
