install:
	corepack enable && pnpm install
verify:
	pnpm lint && pnpm typecheck && pnpm test && pnpm validate:catalog && pnpm build
dev:
	pnpm dev
container:
	docker compose up --build
