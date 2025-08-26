import { RESPONSES, TEMPLATES } from '../constants';

/**
 * Utility functions for handling state machine responses
 */
export class ResponseUtils {
  /**
   * Format a response with dynamic content replacement
   */
  static formatResponse(responseKey: string, replacements: Record<string, string> = {}): string {
    let response = RESPONSES[responseKey] || '';

    // Replace placeholders with actual content
    Object.entries(replacements).forEach(([placeholder, value]) => {
      const placeholderPattern = new RegExp(`\\[${placeholder}\\]`, 'g');
      response = response.replace(placeholderPattern, value);
    });

    return response;
  }

  /**
   * Check if a response contains placeholders that need replacement
   */
  static hasPlaceholders(response: string): boolean {
    return /\[.*?_PLACEHOLDER\]/.test(response);
  }

  /**
   * Get all placeholder names from a response
   */
  static getPlaceholders(response: string): string[] {
    const matches = response.match(/\[(.*?_PLACEHOLDER)\]/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Validate that all required placeholders have been replaced
   */
  static validateReplacements(response: string, replacements: Record<string, string>): boolean {
    const placeholders = this.getPlaceholders(response);
    return placeholders.every(placeholder => placeholder in replacements);
  }

  /**
   * Format a Lumos response with system explanation prepended and tips appended
   */
  static formatLumosResponse(
    responseKey: string,
    replacements: Record<string, string> = {}
  ): string {
    const coreResponse = this.formatResponse(responseKey, replacements);
    const systemExplanation = TEMPLATES.system_explanation || '';
    const tipsAndTricks = TEMPLATES.tips_and_tricks || '';

    // Combine: system explanation + core response + tips and tricks
    const parts = [systemExplanation, coreResponse, tipsAndTricks].filter(part => part.trim());
    return parts.join('\n\n');
  }
}
