# Paglikha App

A CLI tool to create Paglikha monorepo applications with Turborepo, React, Next.js, and more. This template is built on top of shadcn/ui monorepo template

This is built mainly for me and how I like to build my Typescript applications

## Usage

### Create a new project

```bash
bunx paglikha-app my-app-name
```

### Create in current directory

```bash
bunx paglikha-app ./
```

### Interactive mode

```bash
bunx paglikha-app
```

The CLI will prompt you for a project name.

## What's included

- **Monorepo structure** with Turborepo
- **Multiple apps**: React app, Next.js sites, API, and Cloudflare Functions
- **Shared packages**: UI components, ESLint config, TypeScript config
- **Modern tooling**: Bun, TypeScript, Tailwind CSS, SST
- **Development ready**: Pre-configured scripts and dependencies

## Project Structure

```
your-app/
├── apps/
│   ├── api/          # API server
│   ├── app/          # React application
│   ├── functions/    # Cloudflare/lambda Functions
│   └── www/          # Marketing site
├── packages/
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/               # Shared UI components
└── package.json      # Root package.json with workspaces
```

## Getting Started

After creating your project:

```bash
cd your-app-name
bun dev
```

This will start all development servers using Turborepo.

## Requirements

- Node.js 18+
- Bun (recommended package manager)

## Next Steps

- Add Drizzle ORM to packages and support for multi-db setup in Turso
