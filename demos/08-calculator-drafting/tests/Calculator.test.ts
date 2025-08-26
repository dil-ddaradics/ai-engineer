import { Calculator } from '../src/Calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    test('should add two positive numbers', () => {
      // TODO: Implement test
      expect(() => calculator.add(2, 3)).toThrow('Not implemented');
    });
  });

  describe('subtract', () => {
    test('should subtract two numbers', () => {
      // TODO: Implement test
      expect(() => calculator.subtract(5, 3)).toThrow('Not implemented');
    });
  });

  describe('multiply', () => {
    test('should multiply two numbers', () => {
      // TODO: Implement test
      expect(() => calculator.multiply(4, 3)).toThrow('Not implemented');
    });
  });

  describe('divide', () => {
    test('should divide two numbers', () => {
      // TODO: Implement test
      expect(() => calculator.divide(10, 2)).toThrow('Not implemented');
    });
  });
});
