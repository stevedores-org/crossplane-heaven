#!/usr/bin/env bun
import { dump } from "js-yaml";
import { writeFileSync } from "fs";
import { config } from "./src/config";
import {
  generateCrossplaneProvider,
  generateProviderConfig,
  generateControllerConfig,
  generateServiceAccount,
} from "./src/generators/crossplane";

const OUTPUT_BASE = "../../infrastructure/crossplane/providers";

console.log("🎯 Generating Crossplane Provider manifests...\n");

const gcpSaEmail = `crossplane@${config.project.id}.iam.gserviceaccount.com`;

// 1. Provider + ControllerConfig + ServiceAccount (apply first)
const providers = config.crossplane.providers.map(p =>
  generateCrossplaneProvider(p.name, p.package, true)
);
const controllerConfig = generateControllerConfig("provider-gcp", gcpSaEmail);
const serviceAccount = generateServiceAccount("provider-gcp", gcpSaEmail);

const providerYaml = [
  ...providers,
  controllerConfig,
  serviceAccount,
].map(r => dump(r)).join("---\n");

writeFileSync(`${OUTPUT_BASE}/provider.yaml`, providerYaml);
console.log("✅ Generated: provider.yaml");

// 2. ProviderConfig (apply after Provider is ready)
const providerConfig = generateProviderConfig(config, true);
const providerConfigYaml = dump(providerConfig);

writeFileSync(`${OUTPUT_BASE}/providerconfig.yaml`, providerConfigYaml);
console.log("✅ Generated: providerconfig.yaml");

console.log("\n✨ Manifests generated successfully!");
