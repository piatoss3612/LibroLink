# zkSync Native Account Abstraction Demo

## Contracts

### Setup

```bash
$ npx zksync-cli create --template hardhat_solidity contracts
Using Hardhat + Solidity template
? Private key of the wallet responsible for deploying contracts (optional)
? Package manager yarn

Setting up template in zkSync-native-aa-demo/contracts...
✔ Cloned template
✔ Environment variables set up
✔ Dependencies installed

🎉 All set up! 🎉

--------------------------

Navigate to your project: cd contracts

Directory Overview:
  - Contracts: /contracts
  - Deployment Scripts: /deploy

Commands:
  - Compile your contracts: yarn compile
  - Deploy your contract: yarn deploy
    - Tip: You can use the --network option to specify the network to deploy to.

Further Reading:
  - Check out the README file in the project location for more details: contracts/README.md
```

## Frontend

### Setup

```bash
$ yarn create next-app
yarn create v1.22.21
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...

warning Your current version of Yarn is out of date. The latest version is "1.22.22", while you're on "1.22.21".
info To upgrade, run the following command:
$ curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
success Installed "create-next-app@14.2.3" with binaries:
      - create-next-app
✔ What is your project named? … frontend
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like to use `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to customize the default import alias (@/*)? … No / Yes
Creating a new Next.js app in zkSync-native-aa-demo/frontend.

Using yarn.

Initializing project with template: app


Installing dependencies:
- react
- react-dom
- next

Installing devDependencies:
- typescript
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next

yarn install v1.22.21
info No lockfile found.
[1/4] Resolving packages...
warning eslint > file-entry-cache > flat-cache > rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
warning eslint > file-entry-cache > flat-cache > rimraf > glob@7.2.3: Glob versions prior to v9 are no longer supported
warning eslint > file-entry-cache > flat-cache > rimraf > glob > inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
Done in 17.90s.
Success! Created frontend at zkSync-native-aa-demo/frontend

Done in 34.30s.
```
