/**
 * Sample test file to demonstrate Jest setup
 */

describe('Sample Test Suite', () => {
    test('should perform basic arithmetic', () => {
        expect(2 + 2).toBe(4);
        expect(10 - 5).toBe(5);
        expect(3 * 4).toBe(12);
        expect(15 / 3).toBe(5);
    });

    test('should handle arrays', () => {
        const fruits = ['apple', 'banana', 'orange'];
        expect(fruits).toHaveLength(3);
        expect(fruits).toContain('banana');
        expect(fruits).toEqual(['apple', 'banana', 'orange']);
    });

    test('should handle objects', () => {
        const user = {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com'
        };

        expect(user).toHaveProperty('name');
        expect(user.name).toBe('John Doe');
        expect(user).toMatchObject({
            name: 'John Doe',
            age: 30
        });
    });

    test('should handle async operations', async () => {
        const promise = Promise.resolve('Hello World');
        await expect(promise).resolves.toBe('Hello World');
    });

    test('should handle mock functions', () => {
        const mockFn = jest.fn();
        mockFn('test');
        mockFn('test2');

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenCalledWith('test');
        expect(mockFn).toHaveBeenLastCalledWith('test2');
    });
}); 