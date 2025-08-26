# Calculator Demo

A production-ready TypeScript calculator class with comprehensive testing and error handling.

## Features

- ✅ Basic arithmetic operations (add, subtract, multiply, divide)
- ✅ Comprehensive input validation (NaN, Infinity, non-numbers)
- ✅ Division by zero protection with descriptive errors
- ✅ 100% test coverage with edge case handling
- ✅ TypeScript strict mode compliance
- ✅ Full JSDoc documentation

## Installation

```bash
npm install
```

## Usage

```typescript
import { Calculator } from './src/Calculator';

const calc = new Calculator();

// Basic operations
console.log(calc.add(5, 3)); // 8
console.log(calc.subtract(10, 4)); // 6
console.log(calc.multiply(6, 7)); // 42
console.log(calc.divide(15, 3)); // 5

// Error handling
try {
  calc.divide(10, 0);
} catch (error) {
  console.log(error.message); // "Division by zero is not allowed"
}
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build project
npm run build

# Watch mode for development
npm run test:watch
```

## Test Coverage

This project maintains 100% test coverage including:

- All arithmetic operations
- Edge cases (zero, negatives, decimals)
- Error conditions (NaN, Infinity, division by zero)
- Input validation for all method parameters

## Production Ready

This calculator implementation has been thoroughly reviewed and addresses all production concerns:

- Robust error handling
- Comprehensive test suite
- TypeScript type safety
- Clear documentation
- Performance optimized
