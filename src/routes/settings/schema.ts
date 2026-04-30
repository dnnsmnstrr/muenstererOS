import { z } from 'zod';
export const settingsSchema = z.object({
    debug: z.boolean().default(false),
    mode: z.string().default('system'),
    language: z.string().default('en'),
    dvdBounceEnabled: z.boolean().default(false),
    backgroundTexture: z.string().default('dots'),
    backgroundSize: z.number().default(1),
    backgroundSpacing: z.number().default(16)
});
export type SettingsSchema = typeof settingsSchema;
