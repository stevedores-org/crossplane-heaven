import type { InfraConfigType, PersistentVolumeClaimType } from "../types";

export function generatePVCs(config: InfraConfigType): PersistentVolumeClaimType[] {
  if (!config.storage) return [];

  return config.storage.map((s) => ({
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
      name: s.name,
      namespace: "default", // Defaulting to default namespace for application storage
    },
    spec: {
      accessModes: ["ReadWriteOnce"],
      storageClassName: s.storageClass || "standard-rwo",
      resources: {
        requests: {
          storage: s.size,
        },
      },
    },
  }));
}
