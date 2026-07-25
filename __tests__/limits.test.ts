import { clampText, LIMITS } from '@domain/limits';


describe('limits', () => {

    test('returns shorter strings unchanged', () => {
        expect(clampText("hello", 10)).toBe("hello");
    });

    test('returns exact length strings unchanged', () => {
        expect(clampText("hello", 5)).toBe("hello");
    });

    test('truncates longer strings', () => {
        expect(clampText("helloworld", 5)).toBe("hello");
    });

    test('returns empty string for undefined', () => {
        expect(clampText(undefined, 10)).toBe("");
    });

    test('returns empty string unchanged', () => {
        expect(clampText("", 10)).toBe("");
    });

    test('returns empty string when max is zero', () => {
        expect(clampText("hello", 0)).toBe("");
    });

    test('all limits are positive numbers', () => {
        Object.values(LIMITS).forEach(limit => {
            expect(limit).toBeGreaterThan(0);
        });
    });

});