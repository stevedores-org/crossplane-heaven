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
import { generateGitRepository, generateFluxKustomization } from "./src/generators/flux";
import { generateClusterSecretStore } from "./src/generators/eso";
import { generatePVCs } from "./src/generators/storage";
import { generateAppManifests } from "./src/generators/app";

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

const gcpDefinitionsKustomization = generateFluxKustomization(
  "infrastructure-gcp-definitions",
  "./infrastructure/gcp/compositions",
  config.github.repo,
  ["infrastructure-provider-configs"]
);

const gcpClaimsKustomization = generateFluxKustomization(
  "infrastructure-gcp-claims",
  "./infrastructure/gcp/claims",
  config.github.repo,
  ["infrastructure-gcp-definitions"]
);

const storageKustomization = generateFluxKustomization(
  "infrastructure-storage",
  "./infrastructure/storage",
  config.github.repo,
  ["infrastructure-gcp-claims"]
);

const appsKustomization = generateFluxKustomization(
  "infrastructure-apps",
  "./infrastructure/apps",
  config.github.repo,
  ["infrastructure-storage"]
);

writeYaml("../clusters/stevedores-cluster/flux-system/gotk-sync.yaml", [
  gitRepo,
  crossplaneKustomization,
  esoKustomization,
  providersKustomization,
  providerConfigKustomization,
  gcpDefinitionsKustomization,
  gcpClaimsKustomization,
  storageKustomization,
  appsKustomization,
]);

// 3. Generate ESO ClusterSecretStore
const clusterSecretStore = generateClusterSecretStore(config);
writeYaml("eso/cluster-secret-store.yaml", [clusterSecretStore]);

// 4. Generate Storage manifests
const pvcs = generatePVCs(config);
if (pvcs.length > 0) {
  writeYaml("storage/manifests.yaml", pvcs);
}

// 5. Generate Application manifests
const apps = generateAppManifests(config);
if (apps.length > 0) {
  writeYaml("apps/manifests.yaml", apps);
}

console.log("\n✨ All manifests generated successfully!");
console.log("\n📝 Next steps:");
console.log("  1. Review generated YAML files");
console.log("  2. Commit changes to Git");
console.log("  3. Apply with: kubectl apply -k clusters/stevedores-cluster/flux-system/");
