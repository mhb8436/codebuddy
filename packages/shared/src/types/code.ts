export type SupportedLanguage = 'javascript' | 'typescript' | 'python';

export interface CodeExecuteRequest {
  language: SupportedLanguage;
  code: string;
}

export interface CodeExecuteResponse {
  output: string;
  error?: string;
  exitCode: number;
  executionTime: number;
}
