import { Calculator } from '../src/Calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    test('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    test('should add negative numbers', () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    test('should add positive and negative numbers', () => {
      expect(calculator.add(5, -3)).toBe(2);
    });

    test('should add decimal numbers', () => {
      expect(calculator.add(2.5, 3.7)).toBeCloseTo(6.2);
    });
  });

  describe('subtract', () => {
    test('should subtract two numbers', () => {
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    test('should subtract negative numbers', () => {
      expect(calculator.subtract(-2, -3)).toBe(1);
    });

    test('should handle decimal subtraction', () => {
      expect(calculator.subtract(5.5, 2.2)).toBeCloseTo(3.3);
    });
  });

  describe('multiply', () => {
    test('should multiply two numbers', () => {
      expect(calculator.multiply(4, 3)).toBe(12);
    });

    test('should multiply by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });

    test('should multiply negative numbers', () => {
      expect(calculator.multiply(-2, 3)).toBe(-6);
    });

    test('should multiply decimal numbers', () => {
      expect(calculator.multiply(2.5, 4)).toBe(10);
    });
  });

  describe('divide', () => {
    test('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    test('should handle decimal division', () => {
      expect(calculator.divide(7.5, 2.5)).toBe(3);
    });

    test('should throw error for division by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
    });
  });

  describe('input validation', () => {
    test('should throw error for non-number inputs in add', () => {
      expect(() => calculator.add('a' as any, 2)).toThrow('Both arguments must be numbers');
    });

    test('should throw error for NaN inputs', () => {
      expect(() => calculator.add(NaN, 2)).toThrow('Arguments cannot be NaN');
    });

    test('should throw error for NaN in division', () => {
      expect(() => calculator.divide(10, NaN)).toThrow('Arguments cannot be NaN');
    });
  });
});
