import Agent from "../../core/Agent";

export const add = (a, b) => {
	return a + b;
};

test('adds 1 + 2 to equal 3', () => {
	expect(add(1, 2)).toBe(3);
});