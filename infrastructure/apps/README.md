# Infrastructure Apps

Kubernetes manifests for infrastructure applications deployed to the GKE cluster.

## Deployment Workflow

**Build Once, Test, Deploy to Production:**

1. **Build & Push Preview**
   ```bash
   gcloud builds submit --project=gcp-lornu-ai \
     --tag=us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/<app>:preview
   ```

2. **Test on Preview**
   - Frontend: https://preview.lornu.ai
   - Verify functionality before promoting to production

3. **Promote to Production**
   ```bash
   gcloud artifacts docker tags add \
     us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/<app>:preview \
     us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/<app>:latest
   
   kubectl rollout restart deployment/<app> -n default
   ```

## Applications

| App | Preview | Production | Image Tag |
|-----|---------|------------|-----------|
| lornu-ai-frontend | preview.lornu.ai | lornu.ai | `:preview` / `:latest` |
| lornu-ai-backend | api.lornu.ai | api.lornu.ai | `:latest` |
| stevedores-org | - | stevedores.org | `:latest` |
| oxidizedgraph | - | - | `:latest` |
| oxidizedrag | - | graphrag.stevedores.org | `:latest` |

## Flux Reconciliation

Managed by Flux kustomization `infrastructure-apps` in `flux-system` namespace.
Source: `stevedores-org/crossplane-heaven` → `./infrastructure/apps`

Reconciliation interval: 10 minutes
