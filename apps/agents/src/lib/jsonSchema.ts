import type { z } from "zod";

/**
 * Lightweight zod -> JSON Schema for Anthropic tool input_schema. Covers
 * the small subset we use (object / string / number / boolean / array /
 * enum / optional). Replace with `zod-to-json-schema` if a richer
 * surface is needed.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = (schema as unknown as { _def: { typeName: string } })._def;
  switch (def.typeName) {
    case "ZodObject": {
      const shape = (
        schema as unknown as { _def: { shape: () => Record<string, z.ZodTypeAny> } }
      )._def.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, child] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(child);
        if (!child.isOptional()) required.push(key);
      }
      return { type: "object", properties, required };
    }
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodArray":
      return {
        type: "array",
        items: zodToJsonSchema(
          (schema as unknown as { _def: { type: z.ZodTypeAny } })._def.type,
        ),
      };
    case "ZodEnum":
      return {
        type: "string",
        enum: (schema as unknown as { _def: { values: string[] } })._def.values,
      };
    case "ZodOptional":
    case "ZodDefault":
    case "ZodNullable":
      return zodToJsonSchema(
        (schema as unknown as { _def: { innerType: z.ZodTypeAny } })._def
          .innerType,
      );
    default:
      return {};
  }
}
