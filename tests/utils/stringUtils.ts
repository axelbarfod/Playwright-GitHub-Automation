import { resolve, join } from "path";
import { readFileSync } from "fs";

export class StringUtils {
  private static readonly SCHEMAS_DIR = resolve(__dirname, "../api/schemas");

  public static readSchemaFile(schemaFileName: string): any {
    try {
      const filePath = join(this.SCHEMAS_DIR, schemaFileName);
      const fileContent = readFileSync(filePath, "utf8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading schema file ${schemaFileName}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to read schema file ${schemaFileName}: ${errorMessage}`,
      );
    }
  }

  public static async readSchemaFileAsync(
    schemaFileName: string,
  ): Promise<any> {
    try {
      const filePath = join(this.SCHEMAS_DIR, schemaFileName);
      const fileContent = readFileSync(filePath, "utf8"); // Using sync for simplicity
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading schema file ${schemaFileName}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to read schema file ${schemaFileName}: ${errorMessage}`,
      );
    }
  }

  public static prettyPrintJson(obj: any, space: number = 2): string {
    return JSON.stringify(obj, null, space);
  }
}
