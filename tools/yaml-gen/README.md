# Crossplane YAML Generator

Type-safe TypeScript generator for Crossplane infrastructure manifests.

## Why?

- ✅ **Type-safe**: Zod validation catches errors before deployment
- ✅ **Consistent**: Programmatically generated = no manual YAML errors  
- ✅ **DRY**: Single source of truth in `src/config.ts`
- ✅ **Fast**: Bun runtime for instant feedback

## Usage

```bash
# Generate all manifests
bun run index.ts

# Watch mode (regenerate on changes)
bun run --watch index.ts
```

## Structure

```
src/
├── types.ts              # Zod schemas for all K8s resources
├── config.ts             # Single config file (edit this!)
├── generators/
│   ├── crossplane.ts     # Crossplane Provider, ProviderConfig
│   ├── flux.ts          # Flux GitRepository, Kustomization
│   └── eso.ts           # External Secrets Operator
└── index.ts             # Main generator entry point
```

## Generated Files

- `infrastructure/crossplane/providers/provider-gcp-with-oidc.yaml`
- `infrastructure/eso/cluster-secret-store.yaml`
- `clusters/stevedores-cluster/flux-system/gotk-sync.yaml`

## Configuration

Edit `src/config.ts`:

```typescript
export const config: InfraConfigType = {
  project: {
    id: "gcp-lornu-ai",
    region: "us-central1",
  },
  cluster: {
    name: "stevedores-cluster",
    location: "us-central1",
  },
  github: {
    org: "stevedores-org",
    repo: "crossplane-heaven",
    branch: "main",
  },
  crossplane: {
    version: "v1.14.5",
    providers: [
      {
        name: "provider-gcp-container",
        package: "xpkg.upbound.io/upbound/provider-gcp-container:v0.41.0",
      },
    ],
  },
};
```

## Benefits

- **No manual YAML editing** → No indentation errors
- **Type checking** → Catches mistakes at compile time
- **Version control** → Track infrastructure changes in code
- **Reusable** → Add new clusters/providers easily

## Adding New Resources

1. Define Zod schema in `src/types.ts`
2. Create generator function in `src/generators/`
3. Call generator in `index.ts`
4. Run `bun run index.ts`

Done! ✨
