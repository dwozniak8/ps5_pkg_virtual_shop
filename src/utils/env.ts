import { z } from "zod";
import { Config } from "@/types";

const envSchema = z.object({
  SHOP_TITLE: z.string().trim().min(1).default("PS5 PKG Virtual Shop"),
  ADMIN_PASSWORD: z.string().optional(),
  MY_JD_EMAIL: z.string().optional(),
  MY_JD_PASSWORD: z.string().optional(),
  MY_JD_DEVICE_ID: z.string().optional(),
});

type ParsedEnv = z.infer<typeof envSchema>;

let parsedEnvCache: ParsedEnv | null = null;

function parseEnv(): ParsedEnv {
  if (parsedEnvCache) return parsedEnvCache;
  parsedEnvCache = envSchema.parse(process.env);
  return parsedEnvCache;
}

export function loadConfig(): Config {
  const env = parseEnv();
  return {
    shop_title: env.SHOP_TITLE,
  };
}

export function loadJdConfig() {
  const env = parseEnv();
  return {
    email: env.MY_JD_EMAIL,
    password: env.MY_JD_PASSWORD,
    deviceId: env.MY_JD_DEVICE_ID ?? null,
  };
}

export function resetEnvCacheForTests(): void {
  parsedEnvCache = null;
}
