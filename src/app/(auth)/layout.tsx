import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PetWalk - Autenticação",
  description: "Faça login ou cadastre-se na plataforma.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        {children}
      </div>
    </div>
  );
}
