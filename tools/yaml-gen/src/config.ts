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
