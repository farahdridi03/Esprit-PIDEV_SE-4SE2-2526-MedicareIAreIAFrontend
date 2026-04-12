# Testing Guide

This directory contains shared testing utilities and modules for the MediCareAI project.

## Files

### `testing.module.ts`
A shared NgModule that provides all necessary dependencies for testing components and services.

**Provides:**
- `CommonModule`
- `HttpClientTestingModule` - for mocking HTTP calls
- `RouterTestingModule` - for testing routing
- `FormsModule` - for template-driven forms
- `ReactiveFormsModule` - for reactive forms
- `BrowserAnimationsModule` - for animations

**Usage in component tests:**
```typescript
import { TestBed } from '@angular/core/testing';
import { TestingModule } from '@app/testing/testing.module';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      imports: [TestingModule]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
```

### `test-utils.ts`
Helper functions for common testing operations.

**Available utilities:**
- `getElement<T>(fixture, selector)` - Get single element by CSS selector
- `getElements<T>(fixture, selector)` - Get all elements by CSS selector
- `getDebugElement<T>(fixture, selector)` - Get DebugElement for testing
- `detectChanges<T>(fixture)` - Trigger change detection and wait for async
- `setInputValue<T>(fixture, selector, value)` - Set input value and trigger events
- `clickElement<T>(fixture, selector)` - Click element and detect changes
- `getTextContent<T>(fixture, selector)` - Get element text content
- `hasClass<T>(fixture, selector, className)` - Check if element has CSS class

**Usage example:**
```typescript
import { clickElement, setInputValue, getTextContent } from '@app/testing/test-utils';

describe('MyComponent', () => {
  it('should update on input change', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    
    // Set input value
    await setInputValue(fixture, '#myInput', 'Hello');
    
    // Click button
    await clickElement(fixture, '#myButton');
    
    // Check result
    const result = getTextContent(fixture, '#result');
    expect(result).toContain('Hello');
  });
});
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch=true
```

### Run tests with code coverage
```bash
npm test -- --code-coverage
```

### Run specific test file
```bash
npm test -- --include='**/my-component.spec.ts'
```

### Run tests in headless mode (CI/CD)
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Test File Structure

Each component/service should have a `.spec.ts` file next to it.

```
src/app/components/my-component/
├── my-component.component.ts
├── my-component.component.html
├── my-component.component.scss
└── my-component.component.spec.ts
```

## Best Practices

1. **Use TestingModule** - Import `TestingModule` in your test configuration
2. **Mock HTTP calls** - Use `HttpClientTestingModule` for HTTP testing
3. **Use test utils** - Leverage helper functions for DOM queries and interactions
4. **Async handling** - Use `async()` or `fakeAsync()` for async operations
5. **Arrange-Act-Assert** - Follow AAA pattern in tests
6. **Descriptive names** - Use clear, descriptive test names
7. **One assertion per test** - Keep tests focused and simple
8. **Test behavior** - Test what the component does, not how it works

## Example Test Structure

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TestingModule } from '@app/testing/testing.module';
import { 
  clickElement, 
  setInputValue, 
  getTextContent 
} from '@app/testing/test-utils';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      imports: [TestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const title = getTextContent(fixture, '.title');
    expect(title).toBe('Expected Title');
  });

  it('should handle button click', async () => {
    // Arrange
    component.value = 'test';
    
    // Act
    await clickElement(fixture, 'button');
    
    // Assert
    expect(component.clicked).toBeTruthy();
  });
});
```

## Troubleshooting

### "No provider for HttpClient"
**Solution**: Import `TestingModule` in your test configuration.

### "Unknown element 'app-component'"
**Solution**: Declare all child components in the test or use `CUSTOM_ELEMENTS_SCHEMA`.

### "Chart is not defined"
**Solution**: Mock third-party libraries or skip tests that require them.

### "global is not defined"
**Solution**: Update `karma.conf.js` to include proper browser globals.

## Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Test Runner](https://karma-runner.github.io/)
