"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityEntry } from "@/lib/mock/types";
import { ActivityFeed } from "./activity-feed";

type Props = {
  activities: ActivityEntry[];
  jobId: string;
};

export function ActivitySection({ activities, jobId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [allActivities, setAllActivities] = useState(activities);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddActivity = async () => {
    if (!note.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail: note }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to add activity");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const newActivity: ActivityEntry = {
        id: data.id,
        jobId,
        type: data.activity_type,
        actor: "current-user",
        at: data.occurred_at,
        detail: data.detail,
      };

      setAllActivities([newActivity, ...allActivities]);
      setNote("");
      setIsOpen(false);
      toast.success("Activity added");
    } catch (err) {
      console.error("Activity insert error:", err);
      toast.error("Failed to add activity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Recent activity</h3>
        <Button
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          size="sm"
          className="gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-lg disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Site Note
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto pr-2">
        <ActivityFeed entries={allActivities.slice(0, 10)} />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Site Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes, updates, or activity for this job..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-40"
              style={{ fontSize: "18px" }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="rounded-lg text-base h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddActivity}
                disabled={!note.trim() || isLoading}
                className="bg-[#c0392b] hover:bg-[#a93226] text-white rounded-lg text-base h-10 px-4 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Activity"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
