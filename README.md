# Sub Box

## Development

```
cp wrangler.example.toml wrangler.toml
cp .dev.vars.example .dev.vars
```

Setup database

```
bun d1:migrate:local
bun dev
```

## Production

```
bun wrangler d1 create prod-sub-box-db
```

Modify `wrangler.toml` to use the correct database name.

```
bun d1:migrate:remote
bun run deploy
```
