import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Common Testing Utilities
 */

/**
 * Get an element by CSS selector
 */
export function getElement<T>(fixture: ComponentFixture<T>, selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
}

/**
 * Get all elements by CSS selector
 */
export function getElements<T>(fixture: ComponentFixture<T>, selector: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(selector);
}

/**
 * Get DebugElement by CSS selector
 */
export function getDebugElement<T>(fixture: ComponentFixture<T>, selector: string): DebugElement | null {
    return fixture.debugElement.query(By.css(selector));
}

/**
 * Trigger change detection and wait for async operations
 */
export async function detectChanges<T>(fixture: ComponentFixture<T>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
}

/**
 * Set input value and trigger change detection
 */
export async function setInputValue<T>(
    fixture: ComponentFixture<T>,
    selector: string,
    value: string
): Promise<void> {
    const input = getElement(fixture, selector) as HTMLInputElement;
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        await detectChanges(fixture);
    }
}

/**
 * Click an element and trigger change detection
 */
export async function clickElement<T>(
    fixture: ComponentFixture<T>,
    selector: string
): Promise<void> {
    const element = getElement(fixture, selector) as HTMLElement;
    if (element) {
        element.click();
        await detectChanges(fixture);
    }
}

/**
 * Get text content of an element
 */
export function getTextContent<T>(fixture: ComponentFixture<T>, selector: string): string {
    const element = getElement(fixture, selector);
    return element?.textContent?.trim() || '';
}

/**
 * Check if element has a CSS class
 */
export function hasClass<T>(fixture: ComponentFixture<T>, selector: string, className: string): boolean {
    const element = getElement(fixture, selector);
    return element?.classList.contains(className) || false;
}
