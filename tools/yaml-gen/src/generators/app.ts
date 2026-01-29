import type { InfraConfigType, DeploymentType, ServiceType } from "../types";

export function generateAppManifests(config: InfraConfigType): (DeploymentType | ServiceType)[] {
  if (!config.apps) return [];

  const manifests: (DeploymentType | ServiceType)[] = [];

  for (const app of config.apps) {
    // 1. Deployment
    const deployment: DeploymentType = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: app.name,
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
  }

  return manifests;
}
