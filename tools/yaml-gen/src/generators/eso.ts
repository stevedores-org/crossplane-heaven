import type { InfraConfigType, ClusterSecretStoreType } from "../types";

export function generateClusterSecretStore(
  config: InfraConfigType
): ClusterSecretStoreType {
  return {
    apiVersion: "external-secrets.io/v1beta1",
    kind: "ClusterSecretStore",
    metadata: {
      name: "gcp-secret-manager",
    },
    spec: {
      provider: {
        gcpsm: {
          projectID: config.project.id,
          auth: {
            workloadIdentity: {
              clusterLocation: config.cluster.location,
              clusterName: config.cluster.name,
              serviceAccountRef: {
                name: "external-secrets-sa",
                namespace: "external-secrets-system",
              },
            },
          },
        },
      },
    },
  };
}
