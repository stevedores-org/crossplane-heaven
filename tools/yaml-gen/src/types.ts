import { z } from "zod";

// Kubernetes base types
export const K8sMetadata = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
});

export const K8sResource = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadata,
});

// Crossplane Provider
export const CrossplaneProvider = K8sResource.extend({
  apiVersion: z.literal("pkg.crossplane.io/v1"),
  kind: z.literal("Provider"),
  spec: z.object({
    package: z.string(),
    controllerConfigRef: z.object({
      name: z.string(),
    }).optional(),
  }),
});

// Crossplane ProviderConfig
export const ProviderConfig = K8sResource.extend({
  apiVersion: z.string(),
  kind: z.literal("ProviderConfig"),
  spec: z.object({
    projectID: z.string(),
    credentials: z.object({
      source: z.enum(["InjectedIdentity", "Secret"]),
      secretRef: z.object({
        name: z.string(),
        namespace: z.string(),
        key: z.string(),
      }).optional(),
    }),
  }),
});

// Flux Kustomization
export const FluxKustomization = K8sResource.extend({
  apiVersion: z.literal("kustomize.toolkit.fluxcd.io/v1"),
  kind: z.literal("Kustomization"),
  spec: z.object({
    interval: z.string(),
    path: z.string(),
    prune: z.boolean(),
    sourceRef: z.object({
      kind: z.string(),
      name: z.string(),
    }),
    dependsOn: z.array(z.object({
      name: z.string(),
    })).optional(),
  }),
});

// ESO ClusterSecretStore
export const ClusterSecretStore = K8sResource.extend({
  apiVersion: z.literal("external-secrets.io/v1beta1"),
  kind: z.literal("ClusterSecretStore"),
  spec: z.object({
    provider: z.object({
      gcpsm: z.object({
        projectID: z.string(),
        auth: z.object({
          workloadIdentity: z.object({
            clusterLocation: z.string(),
            clusterName: z.string(),
            serviceAccountRef: z.object({
              name: z.string(),
              namespace: z.string(),
            }),
          }),
        }),
      }),
    }),
  }),
});

// Kubernetes PersistentVolumeClaim
export const PersistentVolumeClaim = K8sResource.extend({
  apiVersion: z.literal("v1"),
  kind: z.literal("PersistentVolumeClaim"),
  spec: z.object({
    accessModes: z.array(z.string()),
    storageClassName: z.string().optional(),
    resources: z.object({
      requests: z.object({
        storage: z.string(),
      }),
    }),
  }),
});

// Config types
export const InfraConfig = z.object({
  project: z.object({
    id: z.string(),
    region: z.string(),
  }),
  cluster: z.object({
    name: z.string(),
    location: z.string(),
  }),
  github: z.object({
    org: z.string(),
    repo: z.string(),
    branch: z.string(),
  }),
  crossplane: z.object({
    version: z.string(),
    providers: z.array(
      z.object({
        name: z.string(),
        package: z.string(),
      })
    ),
  }),
  storage: z
    .array(
      z.object({
        name: z.string(),
        size: z.string(),
        storageClass: z.string().optional(),
      })
    )
    .optional(),
});

export type InfraConfigType = z.infer<typeof InfraConfig>;
export type CrossplaneProviderType = z.infer<typeof CrossplaneProvider>;
export type ProviderConfigType = z.infer<typeof ProviderConfig>;
export type FluxKustomizationType = z.infer<typeof FluxKustomization>;
export type ClusterSecretStoreType = z.infer<typeof ClusterSecretStore>;
export type PersistentVolumeClaimType = z.infer<typeof PersistentVolumeClaim>;
