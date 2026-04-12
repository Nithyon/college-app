"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Valid email required"),
  note: z.string().min(3, "At least 3 characters"),
});

type FormValues = z.infer<typeof schema>;

export function DemoContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form
      className="mx-auto mt-8 max-w-md space-y-4 border border-border bg-card p-6 text-left"
      onSubmit={handleSubmit(() => {
        reset();
        alert("Demo only — no data sent. Wire this to your backend when ready.");
      })}
    >
      <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
        Demo inquiry form (React Hook Form + Zod)
      </p>
      <div className="space-y-2">
        <Label htmlFor="demo-email" className="font-body text-xs uppercase tracking-widest">
          Email
        </Label>
        <Input id="demo-email" type="email" placeholder="you@school.edu" {...register("email")} />
        {errors.email && (
          <p className="font-body text-xs text-muted-foreground">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="demo-note" className="font-body text-xs uppercase tracking-widest">
          Note
        </Label>
        <Input id="demo-note" placeholder="Short message" {...register("note")} />
        {errors.note && (
          <p className="font-body text-xs text-muted-foreground">{errors.note.message}</p>
        )}
      </div>
      <Button type="submit" variant="outline">
        Submit (mock)
      </Button>
    </form>
  );
}
