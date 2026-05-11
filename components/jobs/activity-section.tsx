"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { JobActivity } from "@/lib/mock/types";
import { ActivityFeed } from "./activity-feed";

type Props = {
  activities: JobActivity[];
};

export function ActivitySection({ activities }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [allActivities, setAllActivities] = useState(activities);

  const handleAddActivity = () => {
    if (!note.trim()) return;

    const newActivity: JobActivity = {
      id: `a-${Date.now()}`,
      jobId: activities[0]?.jobId || "",
      type: "note",
      actor: "current-user",
      at: new Date().toISOString(),
      detail: note,
    };

    setAllActivities([newActivity, ...allActivities]);
    setNote("");
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Recent activity</h3>
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Site Note
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto pr-2">
        <ActivityFeed entries={allActivities.slice(0, 10)} />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Site Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes, updates, or activity for this job..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddActivity}
                disabled={!note.trim()}
                className="bg-[#c0392b] hover:bg-[#a93226] text-white rounded-lg"
              >
                Save Activity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
