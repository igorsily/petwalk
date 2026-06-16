"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start gap-2 text-destructive" 
      onClick={async () => {
        setLoading(true);
        await authClient.signOut();
        router.push("/login");
      }}
      disabled={loading}
    >
      <LogOut className="h-4 w-4" /> {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
