import type { InfraConfigType, CrossplaneProviderType, ProviderConfigType } from "../types";

export function generateCrossplaneProvider(
  name: string,
  packageUrl: string,
  useOIDC: boolean = true
): CrossplaneProviderType {
  return {
    apiVersion: "pkg.crossplane.io/v1",
    kind: "Provider",
    metadata: {
      name,
      labels: {
        "app.kubernetes.io/managed-by": "yaml-gen",
      },
    },
    spec: {
      package: packageUrl,
      ...(useOIDC && {
        controllerConfigRef: {
          name: "gcp-workload-identity",
        },
      }),
    },
  };
}

export function generateProviderConfig(
  config: InfraConfigType,
  useOIDC: boolean = true
): ProviderConfigType {
  return {
    apiVersion: "gcp.upbound.io/v1beta1",
    kind: "ProviderConfig",
    metadata: {
      name: "gcp-provider",
    },
    spec: {
      projectID: config.project.id,
      credentials: {
        source: useOIDC ? "InjectedIdentity" : "Secret",
        ...(! useOIDC && {
          secretRef: {
            name: "gcp-credentials",
            namespace: "crossplane-system",
            key: "credentials.json",
          },
        }),
      },
    },
  };
}

export function generateControllerConfig(saName: string, gcpSaEmail: string) {
  return {
    apiVersion: "pkg.crossplane.io/v1alpha1",
    kind: "ControllerConfig",
    metadata: {
      name: "gcp-workload-identity",
    },
    spec: {
      podSecurityContext: {
        fsGroup: 2000,
      },
      serviceAccountName: saName,
    },
  };
}

export function generateServiceAccount(name: string, gcpSaEmail: string) {
  return {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      name,
      namespace: "crossplane-system",
      annotations: {
        "iam.gke.io/gcp-service-account": gcpSaEmail,
      },
    },
  };
}
