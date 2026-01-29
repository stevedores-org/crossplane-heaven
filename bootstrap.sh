#!/bin/bash
set -e

echo "🚀 Bootstrapping Crossplane with Flux on GKE"

# Prerequisites check
if ! command -v flux &> /dev/null; then
    echo "❌ flux CLI not found. Install: https://fluxcd.io/flux/installation/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found"
    exit 1
fi

# Verify cluster access
echo "📡 Checking cluster access..."
kubectl cluster-info

# Bootstrap Flux
echo "🎯 Bootstrapping Flux..."
flux check --pre

# Install Flux components
echo "📦 Installing Flux GitOps Toolkit..."
flux install \
  --components-extra=image-reflector-controller,image-automation-controller \
  --export > clusters/stevedores-cluster/flux-system/gotk-components.yaml

# Apply Flux system
kubectl apply -k clusters/stevedores-cluster/flux-system/

echo "✅ Flux bootstrap complete!"
echo ""
echo "🔄 Flux will now sync and install:"
echo "  - Crossplane (infrastructure/crossplane/install)"
echo "  - External Secrets Operator (infrastructure/eso/install)"  
echo "  - GCP Provider with OIDC (infrastructure/crossplane/providers)"
echo ""
echo "📊 Monitor with:"
echo "  flux get kustomizations --watch"
echo "  kubectl get providers"
echo "  kubectl get providerconfigs"
echo ""
echo "🔐 Next steps:"
echo "  1. Set up GCP Workload Identity binding:"
echo "     gcloud iam service-accounts add-iam-policy-binding \\"
echo "       crossplane@gcp-lornu-ai.iam.gserviceaccount.com \\"
echo "       --role roles/iam.workloadIdentityUser \\"
echo "       --member \"serviceAccount:gcp-lornu-ai.svc.id.goog[crossplane-system/provider-gcp]\""
echo ""
echo "  2. Grant Crossplane SA permissions:"
echo "     gcloud projects add-iam-policy-binding gcp-lornu-ai \\"
echo "       --member=\"serviceAccount:crossplane@gcp-lornu-ai.iam.gserviceaccount.com\" \\"
echo "       --role=\"roles/container.admin\""
