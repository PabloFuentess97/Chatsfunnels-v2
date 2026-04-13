"use client";

import Card from "@/components/ui/card";

export default function RoundsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rondas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visualiza y gestiona las rondas de trafico de tus grupos</p>
      </div>
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Las rondas se gestionan dentro de cada grupo. Ve a Grupos para iniciar o ver rondas.</p>
        </div>
      </Card>
    </div>
  );
}
