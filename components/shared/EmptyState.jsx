import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Ma'lumot topilmadi", description = "Hali hech qanday ma'lumot qo'shilmagan" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <Inbox size={36} className="text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
