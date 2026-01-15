import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [],
	test: {
		environment: "node",
		include: [
			"tests/**/*.{test,spec}.{js,ts}",
		],
		globals: true,
	},
});
