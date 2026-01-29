import type { InfraConfigType } from "./types";

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
    branch: "master",
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
  storage: [
    { name: "oxidizedgraph-data", size: "20Gi" },
    { name: "oxidizedrag-db", size: "50Gi" },
    { name: "gitoxide-repos", size: "100Gi" },
  ],
  apps: [
    {
      name: "oxidizedgraph",
      image: "us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/oxidizedgraph:latest",
      port: 8080,
      replicas: 2,
      pvcName: "oxidizedgraph-data",
      mountPath: "/app/data",
      env: {
        RUST_LOG: "info",
        STORAGE_PATH: "/app/data",
      },
    },
    {
      name: "oxidizedrag",
      image: "us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/oxidizedrag:latest",
      port: 8081,
      replicas: 1,
      pvcName: "oxidizedrag-db",
      mountPath: "/app/db",
      env: {
        RUST_LOG: "debug",
        DB_PATH: "/app/db",
        EMBEDDING_BACKEND: "huggingface",
      },
    },
    {
      name: "stevedores-org",
      image: "us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/stevedores-org:latest",
      port: 8080,
      replicas: 2,
      env: {
        PORT: "8080",
      },
      ingress: {
        host: "stevedores.org",
      },
    },
    {
      name: "lornu-ai-frontend",
      image: "us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/lornu-ai-frontend:latest",
      port: 80,
      replicas: 2,
      env: {
        PORT: "80",
      },
      ingress: {
        host: "lornu.ai",
      },
    },
    {
      name: "lornu-ai-backend",
      image: "us-central1-docker.pkg.dev/gcp-lornu-ai/cloud-run-source-deploy/lornu-ai-backend:latest",
      port: 8080,
      replicas: 2,
      env: {
        PORT: "8080",
        FIRESTORE_PROJECT_ID: "gcp-lornu-ai",
        A2A_PROTOCOL_ENABLED: "true",
      },
      ingress: {
        host: "api.lornu.ai",
      },
    },
  ],
};
