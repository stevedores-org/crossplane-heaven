import type { InfraConfigType, ClusterIssuerType } from "../types";

export function generateCertManagerManifests(config: InfraConfigType): ClusterIssuerType[] {
  return [
    {
      apiVersion: "cert-manager.io/v1",
      kind: "ClusterIssuer",
      metadata: {
        name: "letsencrypt-prod",
      },
      spec: {
        acme: {
          server: "https://acme-v02.api.letsencrypt.org/directory",
          email: "steve@lornu.ai", // Replace with appropriate email
          privateKeySecretRef: {
            name: "letsencrypt-prod",
          },
          solvers: [
            {
              http01: {
                ingress: {
                  class: "gce",
                },
              },
            },
          ],
        },
      },
    },
  ];
}
