import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { PrismaClient } from "@ash-ai/database";
import type {
  DesignFileType,
  ValidationStatus,
  DesignValidationRule,
  FileValidationResult,
} from "./types";

const FileValidationSchema = z.object({
  workspaceId: z.string(),
  designVersionId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileType: z.enum(["AI", "PSD", "PNG", "JPG", "SVG", "PDF", "DST", "EPS"]),
  printMethod: z.enum([
    "SILKSCREEN",
    "DTG",
    "SUBLIMATION",
    "EMBROIDERY",
    "HEAT_TRANSFER",
  ]),
  validationRules: z.array(z.string()).optional(),
});

export class DesignFileValidationSystem extends EventEmitter {
  private validationRules: Map<string, DesignValidationRule> = new Map();

  constructor(private db: PrismaClient) {
    super();
    this.initializeValidationRules();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on("validation:started", this.handleValidationStarted.bind(this));
    this.on("validation:completed", this.handleValidationCompleted.bind(this));
    this.on("validation:failed", this.handleValidationFailed.bind(this));
  }

  private initializeValidationRules() {
    // Screen Printing Rules
    this.addValidationRule({
      id: "silkscreen_resolution",
      name: "Screen Print Resolution",
      type: "RESOLUTION",
      conditions: { minDPI: 300, maxDPI: 600 },
      severity: "ERROR",
      errorMessage: "Screen printing requires 300-600 DPI resolution",
      fixSuggestion:
        "Adjust image resolution to 300-400 DPI for optimal results",
    });

    this.addValidationRule({
      id: "silkscreen_colors",
      name: "Screen Print Color Count",
      type: "PRINT_SPECS",
      conditions: { maxColors: 6, colorMode: "SPOT" },
      severity: "WARNING",
      errorMessage: "Screen printing works best with 6 or fewer spot colors",
      fixSuggestion: "Consider reducing color count or using process colors",
    });

    // DTG Rules
    this.addValidationRule({
      id: "dtg_resolution",
      name: "DTG Resolution",
      type: "RESOLUTION",
      conditions: { minDPI: 300, preferredDPI: 400 },
      severity: "ERROR",
      errorMessage: "DTG printing requires minimum 300 DPI",
      fixSuggestion:
        "Increase resolution to at least 300 DPI, preferably 400 DPI",
    });

    this.addValidationRule({
      id: "dtg_color_mode",
      name: "DTG Color Mode",
      type: "COLOR_MODE",
      conditions: { colorMode: "CMYK", profile: "sRGB" },
      severity: "WARNING",
      errorMessage: "DTG works best with CMYK color mode",
      fixSuggestion:
        "Convert to CMYK color mode for accurate color reproduction",
    });

    // Embroidery Rules
    this.addValidationRule({
      id: "embroidery_format",
      name: "Embroidery File Format",
      type: "FILE_FORMAT",
      conditions: { formats: ["DST", "EMB", "PES", "VP3"] },
      severity: "ERROR",
      errorMessage: "Embroidery requires DST, EMB, PES, or VP3 format",
      fixSuggestion:
        "Convert design to embroidery format using digitizing software",
    });

    this.addValidationRule({
      id: "embroidery_stitch_density",
      name: "Embroidery Stitch Density",
      type: "PRINT_SPECS",
      conditions: { maxDensity: 0.4, minDensity: 0.3 },
      severity: "WARNING",
      errorMessage: "Stitch density should be between 0.3-0.4mm",
      fixSuggestion: "Adjust stitch density for optimal embroidery quality",
    });

    // General Rules
    this.addValidationRule({
      id: "file_size_limit",
      name: "File Size Limit",
      type: "FILE_FORMAT",
      conditions: { maxSizeMB: 50 },
      severity: "ERROR",
      errorMessage: "File size cannot exceed 50MB",
      fixSuggestion: "Compress file or reduce image dimensions",
    });

    this.addValidationRule({
      id: "print_dimensions",
      name: "Print Area Dimensions",
      type: "DIMENSION",
      conditions: { maxWidth: 356, maxHeight: 280 }, // mm
      severity: "ERROR",
      errorMessage: 'Design exceeds maximum print area (14"×11")',
      fixSuggestion: "Resize design to fit within print area limitations",
    });
  }

  private addValidationRule(rule: DesignValidationRule) {
    this.validationRules.set(rule.id, rule);
  }

  async validateDesignFile(data: z.infer<typeof FileValidationSchema>) {
    const validated = FileValidationSchema.parse(data);

    try {
      // Create validation record
      const validation = await this.db.designFileValidation.create({
        data: {
          id: nanoid(),
          workspaceId: validated.workspaceId,
          designVersionId: validated.designVersionId,
          fileName: validated.fileName,
          fileUrl: validated.fileUrl,
          fileType: validated.fileType,
          printMethod: validated.printMethod,
          validationStatus: "VALIDATING",
          startedAt: new Date(),
          createdAt: new Date(),
        },
      });

      this.emit("validation:started", { validation });

      // Perform validation
      const result = await this.performValidation(
        validated.fileUrl,
        validated.fileType,
        validated.printMethod,
        validated.validationRules
      );

      // Update validation record with results
      const updatedValidation = await this.db.designFileValidation.update({
        where: { id: validation.id },
        data: {
          validationStatus: result.isValid ? "PASSED" : "FAILED",
          validationResults: JSON.stringify(result),
          errorCount: result.errors.filter(e => e.severity === "ERROR").length,
          warningCount: result.errors.filter(e => e.severity === "WARNING")
            .length,
          fileMetadata: JSON.stringify(result.metadata),
          completedAt: new Date(),
        },
      });

      if (result.isValid) {
        this.emit("validation:completed", {
          validation: updatedValidation,
          result,
        });
      } else {
        this.emit("validation:failed", {
          validation: updatedValidation,
          result,
        });
      }

      return { validation: updatedValidation, result };
    } catch (error) {
      console.error("File validation failed:", error);

      // Update validation record with error
      await this.db.designFileValidation
        .update({
          where: { id: "temp" }, // This would need the actual ID
          data: {
            validationStatus: "FAILED",
            errorMessage: error.message,
            completedAt: new Date(),
          },
        })
        .catch(() => {}); // Ignore errors in error handling

      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  private async performValidation(
    fileUrl: string,
    fileType: DesignFileType,
    printMethod: string,
    ruleIds?: string[]
  ): Promise<FileValidationResult> {
    const errors: FileValidationResult["errors"] = [];
    let metadata: FileValidationResult["metadata"];

    try {
      // Get file metadata
      metadata = await this.extractFileMetadata(fileUrl, fileType);

      // Get applicable rules
      const rulesToApply = ruleIds
        ? ruleIds.map(id => this.validationRules.get(id)).filter(Boolean)
        : this.getApplicableRules(fileType, printMethod);

      // Apply each validation rule
      for (const rule of rulesToApply) {
        if (!rule) continue;

        const ruleResult = await this.applyValidationRule(
          rule,
          metadata,
          fileUrl
        );
        if (ruleResult) {
          errors.push(ruleResult);
        }
      }

      return {
        isValid: !errors.some(e => e.severity === "ERROR"),
        errors,
        metadata,
      };
    } catch (error) {
      console.error("Validation error:", error);

      return {
        isValid: false,
        errors: [
          {
            rule: "system_error",
            message: `Validation system error: ${error.message}`,
            severity: "ERROR",
          },
        ],
        metadata: metadata || {
          fileSize: 0,
          format: fileType,
        },
      };
    }
  }

  private async extractFileMetadata(fileUrl: string, fileType: DesignFileType) {
    // For image files, use Sharp to extract metadata
    if (["PNG", "JPG", "SVG"].includes(fileType)) {
      try {
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        const imageInfo = await sharp(buffer).metadata();

        return {
          dimensions: {
            width: imageInfo.width || 0,
            height: imageInfo.height || 0,
          },
          dpi: imageInfo.density || 72,
          colorMode: this.getColorMode(imageInfo),
          fileSize: buffer.length,
          format: fileType,
        };
      } catch (error) {
        console.error("Failed to extract image metadata:", error);
      }
    }

    // For other file types, get basic file info
    try {
      const response = await fetch(fileUrl, { method: "HEAD" });
      const fileSize = parseInt(response.headers.get("content-length") || "0");

      return {
        fileSize,
        format: fileType,
      };
    } catch (error) {
      console.error("Failed to get file metadata:", error);
      return {
        fileSize: 0,
        format: fileType,
      };
    }
  }

  private getColorMode(imageInfo: sharp.Metadata): string {
    if (imageInfo.space) {
      return imageInfo.space.toUpperCase();
    }

    // Infer from channels
    switch (imageInfo.channels) {
      case 1:
        return "GRAYSCALE";
      case 3:
        return "RGB";
      case 4:
        return "CMYK";
      default:
        return "RGB";
    }
  }

  private getApplicableRules(
    fileType: DesignFileType,
    printMethod: string
  ): DesignValidationRule[] {
    const rules: DesignValidationRule[] = [];

    // Always apply general rules
    rules.push(
      this.validationRules.get("file_size_limit")!,
      this.validationRules.get("print_dimensions")!
    );

    // Apply print method specific rules
    switch (printMethod) {
      case "SILKSCREEN":
        rules.push(
          this.validationRules.get("silkscreen_resolution")!,
          this.validationRules.get("silkscreen_colors")!
        );
        break;

      case "DTG":
        rules.push(
          this.validationRules.get("dtg_resolution")!,
          this.validationRules.get("dtg_color_mode")!
        );
        break;

      case "EMBROIDERY":
        rules.push(
          this.validationRules.get("embroidery_format")!,
          this.validationRules.get("embroidery_stitch_density")!
        );
        break;
    }

    return rules.filter(Boolean);
  }

  private async applyValidationRule(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"],
    fileUrl: string
  ): Promise<FileValidationResult["errors"][0] | null> {
    switch (rule.type) {
      case "RESOLUTION":
        return this.validateResolution(rule, metadata);

      case "FILE_FORMAT":
        return this.validateFileFormat(rule, metadata);

      case "COLOR_MODE":
        return this.validateColorMode(rule, metadata);

      case "DIMENSION":
        return this.validateDimensions(rule, metadata);

      case "PRINT_SPECS":
        return this.validatePrintSpecs(rule, metadata, fileUrl);

      default:
        return null;
    }
  }

  private validateResolution(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"]
  ): FileValidationResult["errors"][0] | null {
    const dpi = metadata.dpi || 72;
    const { minDPI, maxDPI, preferredDPI } = rule.conditions;

    if (minDPI && dpi < minDPI) {
      return {
        rule: rule.id,
        message: rule.errorMessage,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    if (maxDPI && dpi > maxDPI) {
      return {
        rule: rule.id,
        message: rule.errorMessage,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    if (preferredDPI && Math.abs(dpi - preferredDPI) > 50) {
      return {
        rule: rule.id,
        message: `Resolution is ${dpi} DPI, preferred is ${preferredDPI} DPI`,
        severity: "INFO",
        suggestion: `Consider using ${preferredDPI} DPI for optimal quality`,
      };
    }

    return null;
  }

  private validateFileFormat(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"]
  ): FileValidationResult["errors"][0] | null {
    const { formats, maxSizeMB } = rule.conditions;

    if (formats && !formats.includes(metadata.format)) {
      return {
        rule: rule.id,
        message: rule.errorMessage,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    if (maxSizeMB && metadata.fileSize > maxSizeMB * 1024 * 1024) {
      return {
        rule: rule.id,
        message: rule.errorMessage,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    return null;
  }

  private validateColorMode(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"]
  ): FileValidationResult["errors"][0] | null {
    const { colorMode } = rule.conditions;

    if (colorMode && metadata.colorMode !== colorMode) {
      return {
        rule: rule.id,
        message: `Color mode is ${metadata.colorMode}, expected ${colorMode}`,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    return null;
  }

  private validateDimensions(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"]
  ): FileValidationResult["errors"][0] | null {
    if (!metadata.dimensions) return null;

    const { maxWidth, maxHeight } = rule.conditions;
    const { width, height } = metadata.dimensions;

    // Convert pixels to mm (assuming 300 DPI)
    const widthMM = (width * 25.4) / (metadata.dpi || 300);
    const heightMM = (height * 25.4) / (metadata.dpi || 300);

    if (
      (maxWidth && widthMM > maxWidth) ||
      (maxHeight && heightMM > maxHeight)
    ) {
      return {
        rule: rule.id,
        message: `Design size is ${widthMM.toFixed(1)}×${heightMM.toFixed(1)}mm, maximum is ${maxWidth}×${maxHeight}mm`,
        severity: rule.severity,
        suggestion: rule.fixSuggestion,
      };
    }

    return null;
  }

  private async validatePrintSpecs(
    rule: DesignValidationRule,
    metadata: FileValidationResult["metadata"],
    fileUrl: string
  ): Promise<FileValidationResult["errors"][0] | null> {
    // This would involve more complex validation
    // like counting colors, analyzing stitch density, etc.
    // For now, return a basic implementation
    return null;
  }

  async getValidationHistory(designVersionId: string) {
    return await this.db.designFileValidation.findMany({
      where: { designVersionId },
      orderBy: { createdAt: "desc" },
    });
  }

  async revalidateFile(validationId: string) {
    const validation = await this.db.designFileValidation.findUnique({
      where: { id: validationId },
    });

    if (!validation) {
      throw new Error("Validation record not found");
    }

    return await this.validateDesignFile({
      workspaceId: validation.workspaceId,
      designVersionId: validation.designVersionId,
      fileUrl: validation.fileUrl,
      fileName: validation.fileName,
      fileType: validation.fileType as DesignFileType,
      printMethod: validation.printMethod as any,
    });
  }

  // Event handlers
  private async handleValidationStarted(data: any) {
    console.log(`File validation started: ${data.validation.id}`);
  }

  private async handleValidationCompleted(data: any) {
    console.log(`File validation completed: ${data.validation.id}`);
  }

  private async handleValidationFailed(data: any) {
    console.log(`File validation failed: ${data.validation.id}`);
  }
}
