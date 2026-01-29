import type { InfraConfigType, FluxKustomizationType } from "../types";

export function generateGitRepository(config: InfraConfigType) {
  return {
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "GitRepository",
    metadata: {
      name: config.github.repo,
      namespace: "flux-system",
    },
    spec: {
      interval: "1m0s",
      ref: {
        branch: config.github.branch,
      },
      url: `https://github.com/${config.github.org}/${config.github.repo}`,
    },
  };
}

export function generateFluxKustomization(
  name: string,
  path: string,
  repoName: string,
  dependsOn?: string[]
): FluxKustomizationType {
  return {
    apiVersion: "kustomize.toolkit.fluxcd.io/v1",
    kind: "Kustomization",
    metadata: {
      name,
      namespace: "flux-system",
    },
    spec: {
      interval: "10m0s",
      path,
      prune: true,
      sourceRef: {
        kind: "GitRepository",
        name: repoName,
      },
      ...(dependsOn && {
        dependsOn: dependsOn.map(name => ({ name })),
      }),
    },
  };
}
