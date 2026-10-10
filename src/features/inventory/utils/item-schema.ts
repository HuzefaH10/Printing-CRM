import { z } from "zod";
import { ColumnDef } from "../models/stock";

export function buildItemZodSchema(columns: ColumnDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const col of columns) {
    switch (col.type) {
      case "text": {
        if (col.required) {
          shape[col.id] = z.string().min(1, `${col.label} is required`);
        } else {
          shape[col.id] = z.string().optional().or(z.literal(""));
        }
        break;
      }

      case "number": {
        let numSchema = z.number();
        if (col.min !== undefined) {
          numSchema = numSchema.min(col.min, `${col.label} must be at least ${col.min}`);
        }
        if (col.max !== undefined) {
          numSchema = numSchema.max(col.max, `${col.label} cannot exceed ${col.max}`);
        }

        if (col.required) {
          shape[col.id] = numSchema;
        } else {
          shape[col.id] = numSchema.optional().nullable();
        }
        break;
      }

      case "select": {
        const customSizeObj = z.object({
          w: z.number().gt(0, "Width must be greater than 0"),
          h: z.number().gt(0, "Height must be greater than 0")
        });

        const baseSchema = z.union([z.string(), customSizeObj]);

        if (col.required) {
          shape[col.id] = baseSchema.refine((val) => {
            if (typeof val === "string") return val.trim().length > 0;
            if (typeof val === "object" && val !== null) return val.w > 0 && val.h > 0;
            return false;
          }, { message: `${col.label} is required` });
        } else {
          shape[col.id] = baseSchema.optional().nullable();
        }
        break;
      }

      case "quantity_reams":
      case "quantity_units": {
        if (col.required) {
          shape[col.id] = z.number().min(0.0001, `${col.label} is required`);
        } else {
          shape[col.id] = z.number().min(0, "Quantity cannot be negative").optional();
        }
        break;
      }

      default:
        shape[col.id] = z.any().optional();
    }
  }

  return z.object(shape);
}
