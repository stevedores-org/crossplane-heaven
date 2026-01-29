#!/usr/bin/env bun
import { dump } from "js-yaml";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { config } from "./src/config";
import {
  generateCrossplaneProvider,
  generateProviderConfig,
  generateControllerConfig,
  generateServiceAccount,
} from "./src/generators/crossplane";
import {
  generateGitRepository,
  generateFluxKustomization,
} from "./src/generators/flux";
import { generateClusterSecretStore } from "./src/generators/eso";

const OUTPUT_DIR = "../../infrastructure";

function writeYaml(path: string, resources: any[]) {
  const fullPath = join(OUTPUT_DIR, path);
  const dir = fullPath.split("/").slice(0, -1).join("/");
  mkdirSync(dir, { recursive: true });
  
  const yaml = resources.map(r => dump(r)).join("---\n");
  writeFileSync(fullPath, yaml);
  console.log(`✅ Generated: ${path}`);
}

console.log("🎯 Generating Crossplane infrastructure manifests...\n");

// 1. Generate Crossplane Provider with OIDC
const gcpSaEmail = `crossplane@${config.project.id}.iam.gserviceaccount.com`;
const providers = config.crossplane.providers.map(p =>
  generateCrossplaneProvider(p.name, p.package, true)
);
const controllerConfig = generateControllerConfig("provider-gcp", gcpSaEmail);
const serviceAccount = generateServiceAccount("provider-gcp", gcpSaEmail);
const providerConfig = generateProviderConfig(config, true);

// Split into Provider and ProviderConfig to avoid CRD race conditions
writeYaml("crossplane/providers/gcp/provider/manifests.yaml", [
  ...providers,
  controllerConfig,
  serviceAccount,
]);

writeYaml("crossplane/providers/gcp/config/manifests.yaml", [
  providerConfig,
]);

// 2. Generate Flux GitOps manifests
const gitRepo = generateGitRepository(config);
const crossplaneKustomization = generateFluxKustomization(
  "infrastructure-crossplane",
  "./infrastructure/crossplane/install",
  config.github.repo
);
const esoKustomization = generateFluxKustomization(
  "infrastructure-eso",
  "./infrastructure/eso/install",
  config.github.repo
);
const providersKustomization = generateFluxKustomization(
  "infrastructure-providers",
  "./infrastructure/crossplane/providers/gcp/provider",
  config.github.repo,
  ["infrastructure-crossplane"]
);

const providerConfigKustomization = generateFluxKustomization(
  "infrastructure-provider-configs",
  "./infrastructure/crossplane/providers/gcp/config",
  config.github.repo,
  ["infrastructure-providers"]
);

const gcpKustomization = generateFluxKustomization(
  "infrastructure-gcp",
  "./infrastructure/gcp",
  config.github.repo,
  ["infrastructure-provider-configs"]
);

writeYaml("../clusters/stevedores-cluster/flux-system/gotk-sync.yaml", [
  gitRepo,
  crossplaneKustomization,
  esoKustomization,
  providersKustomization,
  providerConfigKustomization,
  gcpKustomization,
]);

// 3. Generate ESO ClusterSecretStore
const clusterSecretStore = generateClusterSecretStore(config);
writeYaml("eso/cluster-secret-store.yaml", [clusterSecretStore]);

console.log("\n✨ All manifests generated successfully!");
console.log("\n📝 Next steps:");
console.log("  1. Review generated YAML files");
console.log("  2. Commit changes to Git");
console.log("  3. Apply with: kubectl apply -k clusters/stevedores-cluster/flux-system/");
