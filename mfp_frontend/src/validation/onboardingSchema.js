import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Organization name required"),
  industry: z.string().min(1, "Industry required"),
  tagline: z.string().optional(),
});