#!/usr/bin/env node

import { cp, readFile, writeFile, mkdir } from "fs/promises";
import { join, resolve, basename } from "path";
import { spawn } from "child_process";
import { createInterface } from "readline";

async function promptForName(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("What is the name of your project? ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function copyTemplate(
  templatePath: string,
  targetPath: string
): Promise<void> {
  await cp(templatePath, targetPath, { recursive: true });
}

async function updatePackageJson(
  targetPath: string,
  projectName: string
): Promise<void> {
  const packageJsonPath = join(targetPath, "package.json");
  const packageJsonContent = await readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);

  packageJson.name = projectName;

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

async function runCommand(
  command: string,
  args: string[],
  targetPath: string,
  input?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd: targetPath,
      stdio: input ? "pipe" : "inherit",
    });

    if (input) {
      process.stdin?.write(input);
      process.stdin?.end();
    }

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} failed with exit code ${code}`
          )
        );
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

async function runBunInstall(targetPath: string): Promise<void> {
  await runCommand("bun", ["install"], targetPath);
}

async function runSstInit(targetPath: string): Promise<void> {
  // Use --yes flag to skip confirmation, but still need to provide AWS selection
  // The prompt will ask for provider, so we send Enter to select AWS (default)
  const input = "\n";
  await runCommand("bunx", ["sst@latest", "init", "--yes"], targetPath, input);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    let projectName = args[0];
    let targetPath: string;
    let useCurrentDir = false;

    if (!projectName) {
      projectName = await promptForName();
    }

    if (projectName === "./") {
      useCurrentDir = true;
      targetPath = process.cwd();
      projectName = basename(targetPath);
    } else {
      targetPath = resolve(process.cwd(), projectName);
    }

    if (!projectName) {
      console.error("Project name is required");
      process.exit(1);
    }

    console.log(`Creating Paglikha app: ${projectName}`);
    console.log(`Target directory: ${targetPath}`);

    // Get the template path (relative to this script)
    const templatePath = join(__dirname, "..", "templates");

    // Create target directory if it doesn't exist and we're not using current dir
    if (!useCurrentDir) {
      await mkdir(targetPath, { recursive: true });
    }

    // Copy template files
    console.log("Copying template files...");
    await copyTemplate(templatePath, targetPath);

    // Update package.json with the project name
    console.log("Updating package.json...");
    await updatePackageJson(targetPath, projectName);

    // Run bun install
    console.log("Installing dependencies...");
    await runBunInstall(targetPath);

    // Run SST init with default settings
    console.log("Initializing SST...");
    await runSstInit(targetPath);

    console.log(`\n✅ Successfully created ${projectName}!`);

    if (!useCurrentDir) {
      console.log(`\nTo get started:`);
      console.log(`  cd ${projectName}`);
      console.log(`  bun dev`);
    } else {
      console.log(`\nTo get started:`);
      console.log(`  bun dev`);
    }
  } catch (error) {
    console.error("Error creating project:", error);
    process.exit(1);
  }
}

main();
