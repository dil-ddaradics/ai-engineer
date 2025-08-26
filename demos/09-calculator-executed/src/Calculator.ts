/**
 * Simple Calculator class for basic arithmetic operations
 */
export class Calculator {
  /**
   * Add two numbers
   * @param a First number
   * @param b Second number
   * @returns Sum of a and b
   */
  add(a: number, b: number): number {
    this.validateInput(a, b);
    return a + b;
  }

  /**
   * Subtract two numbers
   * @param a First number
   * @param b Second number
   * @returns Difference of a and b
   */
  subtract(a: number, b: number): number {
    this.validateInput(a, b);
    return a - b;
  }

  /**
   * Multiply two numbers
   * @param a First number
   * @param b Second number
   * @returns Product of a and b
   */
  multiply(a: number, b: number): number {
    this.validateInput(a, b);
    return a * b;
  }

  /**
   * Divide two numbers
   * @param a Dividend
   * @param b Divisor
   * @returns Quotient of a and b
   * @throws Error if b is zero
   */
  divide(a: number, b: number): number {
    this.validateInput(a, b);
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }

  /**
   * Validate input parameters
   * @param a First number
   * @param b Second number
   * @throws Error if inputs are not valid numbers
   */
  private validateInput(a: number, b: number): void {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    if (isNaN(a) || isNaN(b)) {
      throw new Error('Arguments cannot be NaN');
    }
  }
}
