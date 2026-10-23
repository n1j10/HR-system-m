import { z } from "zod";

import { AssetCondition } from "@prisma/client";
import { optionalText, requiredText } from "@/lib/validation";

export const ASSET_CATEGORIES = ["Laptop", "Phone", "Monitor", "Car", "Access card", "Other"];

export const assetSchema = z.object({
  name: requiredText,
  category: z.enum(ASSET_CATEGORIES),
  serialNumber: optionalText,
  condition: z.enum(AssetCondition),
});

export const assignAssetSchema = z.object({
  assetId: requiredText,
  employeeId: requiredText,
});

export const assetConditionSchema = z.object({
  assetId: requiredText,
  condition: z.enum(AssetCondition),
});
