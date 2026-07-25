"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAction } from "@/lib/use-action";

export function NewTicketForm() {
  const { run, busyKey, error } = useAction();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  async function submit() {
    const result = await run("new", "space_cloud.api.v3.space.create_ticket", {
      subject: subject.trim(),
      description: description.trim(),
    });
    if (result) {
      setSubject("");
      setDescription("");
    }
  }

  return (
    <div className="space-y-3">
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} />
      <div className="flex items-center gap-3">
        <Button disabled={!subject.trim() || busyKey === "new"} onClick={submit}>
          {busyKey === "new" ? "Creating…" : "Create ticket"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export function ReplyButton({ ticket }: { ticket: string }) {
  const { run, busyKey, error } = useAction();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function submit() {
    const result = await run(ticket, "space_cloud.api.v3.space.reply_ticket", { ticket, message: message.trim() });
    if (result) {
      setMessage("");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="secondary">Reply</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to {ticket}</DialogTitle>
        </DialogHeader>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your reply…" rows={4} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={!message.trim() || busyKey === ticket} onClick={submit}>
          {busyKey === ticket ? "Sending…" : "Send reply"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
