import type { InfraConfigType, DeploymentType, ServiceType, IngressType } from "../types";

export function generateAppManifests(config: InfraConfigType): (DeploymentType | ServiceType | IngressType)[] {
  if (!config.apps) return [];

  const manifests: (DeploymentType | ServiceType | IngressType)[] = [];

  for (const app of config.apps) {
    // 1. Deployment
    const deployment: DeploymentType = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: app.name,
        namespace: "default",
        labels: { app: app.name },
      },
      spec: {
        replicas: app.replicas,
        selector: {
          matchLabels: { app: app.name },
        },
        template: {
          metadata: {
            labels: { app: app.name },
          },
          spec: {
            containers: [
              {
                name: app.name,
                image: app.image,
                ports: [{ containerPort: app.port, name: "http" }],
                resources: {
                  requests: {
                    cpu: app.cpu,
                    memory: app.memory,
                  },
                },
                env: Object.entries(app.env || {}).map(([name, value]) => ({
                  name,
                  value,
                })),
                volumeMounts: app.pvcName && app.mountPath ? [
                  {
                    name: "data",
                    mountPath: app.mountPath,
                  },
                ] : [],
              },
            ],
            volumes: app.pvcName ? [
              {
                name: "data",
                persistentVolumeClaim: {
                  claimName: app.pvcName,
                },
              },
            ] : [],
          },
        },
      },
    };
    manifests.push(deployment);

    // 2. Service
    const service: ServiceType = {
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: `${app.name}-service`,
        namespace: "default",
        labels: { app: app.name },
      },
      spec: {
        selector: { app: app.name },
        ports: [
          {
            port: 80,
            targetPort: app.port,
            name: "http",
          },
        ],
        type: "ClusterIP",
      },
    };
    manifests.push(service);

    // 3. Ingress (if host provided)
    if (app.ingress) {
      const ingress: IngressType = {
        apiVersion: "networking.k8s.io/v1",
        kind: "Ingress",
        metadata: {
          name: `${app.name}-ingress`,
          namespace: "default",
          annotations: {
            "kubernetes.io/ingress.class": "gce",
            "cert-manager.io/cluster-issuer": "letsencrypt-prod",
          },
        },
        spec: {
          rules: [
            {
              host: app.ingress.host,
              http: {
                paths: [
                  {
                    path: app.ingress.path || "/",
                    pathType: "Prefix",
                    backend: {
                      service: {
                        name: `${app.name}-service`,
                        port: { number: 80 },
                      },
                    },
                  },
                ],
              },
            },
          ],
          tls: app.ingress.tls ? [
            {
              hosts: [app.ingress.host],
              secretName: `${app.name}-tls`,
            },
          ] : [],
        },
      };
      manifests.push(ingress);
    }
  }

  return manifests;
}
