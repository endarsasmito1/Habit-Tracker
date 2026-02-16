
import { isTable } from "drizzle-orm";

// Helper to remove relations and other non-table objects
export function removeResolvers(schema: any) {
    const tables: Record<string, any> = {};
    for (const key in schema) {
        if (isTable(schema[key])) {
            tables[key] = schema[key];
        }
    }
    return tables;
}
