import { EpisodeManager } from "@/components/episodes/EpisodeManager";

export default function EditEpisodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit episodes</h1>
        <p className="text-muted-foreground">
          Create, update, and delete headache episodes from one protected page.
        </p>
      </div>

      <EpisodeManager />
    </div>
  );
}
