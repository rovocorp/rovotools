export class ToolError extends Error {
  readonly toolId: string;
  readonly code: string;

  constructor(toolId: string, message: string, code: string = "TOOL_ERROR") {
    super(message);
    this.name = "ToolError";
    this.toolId = toolId;
    this.code = code;
    Object.setPrototypeOf(this, ToolError.prototype);
  }
}

export class ValidationError extends Error {
  readonly fieldId: string;
  readonly code: string;

  constructor(fieldId: string, message: string, code: string = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
    this.fieldId = fieldId;
    this.code = code;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ExecutionError extends Error {
  readonly toolId: string;
  override readonly cause?: unknown;

  constructor(toolId: string, message: string, cause?: unknown) {
    super(message);
    this.name = "ExecutionError";
    this.toolId = toolId;
    this.cause = cause;
    Object.setPrototypeOf(this, ExecutionError.prototype);
  }
}

export class NotFoundError extends Error {
  readonly resource: string;
  readonly identifier: string;

  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.identifier = identifier;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
