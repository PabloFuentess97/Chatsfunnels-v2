"use client";

import Card from "@/components/ui/card";

export default function RoundsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rounds</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage traffic rounds for your groups</p>
      </div>
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Rounds are managed within each group. Go to Groups to start or view rounds.</p>
        </div>
      </Card>
    </div>
  );
}
