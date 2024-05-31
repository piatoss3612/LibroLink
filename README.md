<div align="center">

<h1>LibroLink</h1>
<img src="./assets/LibroNFT.png" width="48%" alt="LibroLink Logo">
<h3>Let's build a Book Club dApp from scratch</h3>
<a href="https://zk-sync-native-aa-demo.vercel.app/">Live Demo</a>
<br>
<br>
<p>Test account for the demo</p>
<pre>
email: test-8685@privy.io
phone: +1 555 555 2506
otp: 459378</pre>
</div>

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Sections](#sections)
- [Roadmap](#roadmap)
- [License](#license)

## Introduction

This project is a quick guide to build a decentralized application (dApp) with:

- Social login
- Native account abstraction
- Paymaster

By the end of this guide, you will have a Book Club dApp where users can:

- Sign in with their social media accounts
- Create a contract account
- Gas sponsored transactions by a paymaster
- Create reading logs for their favorite books
- Create reading challenges
- Join reading challenges and earn rewards

Those who are interested in bridging Web2 users to Web3 can use this guide to build any dApp with their desired features.

> Each section will have a branch with the code for that specific feature.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.10.0)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.22.21)
- [zksync-cli](https://docs.zksync.io/build/tooling/zksync-cli/getting-started.html) (v1.7.1)

## Getting Started

1. Clone the repository

```bash
$ git clone https://github.com/piatoss3612/LibroLink.git
```

2. Install dependencies

```bash
$ cd frontend && yarn install
```

3. Start the frontend

```bash
$ yarn start
```

## Sections

- [1. Social Login with Privy and zkSync Network](https://github.com/piatoss3612/zkSync-native-aa-demo/tree/01.social-login)

## Roadmap

- [x] Implement social login
- [ ] Sponsor gas fees with a paymaster
- [ ] Create a contract account
- [ ] Create reading logs as NFTs
- (WIP)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
