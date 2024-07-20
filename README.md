<div align="center">

<h1>LibroLink</h1>
<img src="./assets/logo.jpg" width="36%" alt="LibroLink Logo">
<h3>Build Your Own Library: Read, Record, and Get Rewarded!</h3>
<a href="https://librolink.vercel.app/">Live Demo</a>
<br>
<br>
<p>Test account for the demo</p>
<pre>
email: test-8685@privy.io
phone: +1 555 555 2506
otp: 459378</pre>
</div>

## Table of Contents

- [Overview](#overview)
- [Book Club dApp](#book-club-dapp)
  - [Description](#description)
  - [Problems and Solutions](#problems-and-solutions)
  - [Key Features](#key-features)
  - [Target Users](#target-users)
  - [Future Roadmap](#future-roadmap)
- [Guides for Building dApps with zkSync Native Account Abstraction](#guides-for-building-dapps-with-zksync-native-account-abstraction)
  - [Introduction](#introduction)
  - [Guide Sections](#guide-sections)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [License](#license)
- [Contributions](#contributions)

## Overview

This project contains two main parts:

1. A Book Club dApp
2. Guides for building dApps with zkSync Native Account Abstraction

---

## Book Club dApp

### Description

This project introduces a simple and intuitive platform for users to record their reading activities, participate in challenges, and earn rewards. By integrating gamified elements, the platform enhances the enjoyment of reading and boosts user engagement. Leveraging blockchain technology, the platform builds upon Web2 user experiences to offer a novel reading experience. This approach allows users to find greater enjoyment in their reading and feel a heightened sense of accomplishment. The platform is designed to be user-friendly and accessible to all reading enthusiasts, regardless of their familiarity with blockchain technology.

### Problems and Solutions

1. **Lack of User Motivation**

   - **Problem**: Traditional book clubs often fail to motivate users to engage in reading activities or write reviews. Recently, users have increasingly preferred reading activities based on experiences through pop-up bookstores or SNS interactions, necessitating methods to encourage active interaction.
   - **Solution**: Implementing a mission system and reading challenge system allows users to engage in reading activities and feel a sense of accomplishment. Completing missions or participating in challenges rewards users with points or tokens, thereby increasing their motivation.

2. **Lack of Trust and Transparency**

   - **Problem**: On centralized platforms, it is difficult to verify the authenticity of reading records and reviews. There is a risk of data manipulation or forgery.
   - **Solution**: By utilizing blockchain technology, all reading records and reviews are transparently recorded and verified. Each record is stored on the blockchain via smart contracts, and all changes are logged to ensure trustworthiness.

3. **Data Ownership Issues**
   - **Problem**: On centralized platforms, the ownership of user-generated content (reading records, reviews, etc.) belongs to the platform. Users cannot fully control their data.
   - **Solution**: Through the dApp, users can own and manage their data. All records are stored on the blockchain, giving users transparent access rights to their data.

### Key Features

1. **Reading Record System**

   - **Description**: A system where users can store and manage the books they've read and their reading records. Once a user finishes reading a book, they can visualize their reading history with generative AI art and record it as a ERC721 NFT.
   - **Record Fields**: Book title, author, reading date, review, etc.
   - **Record View**: An interface that allows users to easily view their reading records
   - **Benefits**: Users can track their reading progress and history, motivating them to read more. The generative AI art adds a fun and creative element to the reading experience.

2. **Buddy System**

<div style="display: flex;">
<img src="./assets/buddy1-removebg.png" alt="Buddy1" width="200">
<img src="./assets/buddy2-removebg.png" alt="Buddy2" width="200">
<img src="./assets/buddy3-removebg.png" alt="Buddy3" width="200">
</div>

- **Description**: A system where users can manage their own avatar as dynamic NFTs and interact with other users. Each avatar is unique and can be customized with various buddies and ornaments.
- **Avatar Customization**: Users can customize their avatars with different buddies and ornaments
- **Interaction**: Users can visit other users' profiles and leave comments or likes
- **Benefits**: Users can express their personalities through avatars and interact with others. This feature enhances user engagement and fosters a sense of community.

3. **Reading Challenge System integrated with Buddy System**

   - **Description**: A system where users can participate in various reading challenges and earn items of their avatars or tokens as rewards.
   - **Challenge Participation**: Read a given book within a certain period or read books on specific topics
   - **Buddy System Integration**: Users can get items for their avatars as rewards for completing challenges
   - **Reward System**: Users can earn points or tokens by completing challenges
   - **Benefits**: Users feel a sense of challenge and accomplishment, motivating them to read more. Additionally, users can earn rewards and items for customizing their avatars, enhancing user engagement.

### Target Users

- **All Reading Enthusiasts**: Anyone who enjoys reading and wants a platform that makes reading activities more enjoyable, allowing them to communicate and compete with others. It is easy to use even without prior knowledge of blockchain technology.
- **Users Interested in Blockchain Technology**: Users looking for a new reading experience leveraging blockchain technology. Blockchain enhances the trust and transparency of reading activities and guarantees users' data ownership.
- **Users Who Prefer Gamified Experiences**: Users who enjoy gamified experiences and want to participate in reading challenges and missions. The platform provides a fun and engaging reading experience.

### Future Roadmap

- **Short-term Goals**: Complete the buddy system, personal reading record system, reading challenge system, and reward system
- **Mid-term Goals**: Incorporate user feedback and improve UI/UX
- **Long-term Goals**: Add virtual events and workshops, integrate VR/AR technology

---

## Guides for Building dApps with zkSync Native Account Abstraction

### Introduction

A series of step-by-step guides to build decentralized applications with zkSync Native Account Abstraction.

The guides will cover the following topics:

- Social login integration
- Smart contract account creation
- Paymaster integration

By the end of this guide, you will have a fully functional dApp where users can:

- Sign in with their social media accounts
- Create a contract account
- Use gas-sponsored transactions by a paymaster
- Create reading logs for their favorite books
- Create reading challenges, join reading challenges, and earn rewards

> Each section will have a branch with the code for that specific feature.

### Guide Sections

| Section                                                                                                                              | Category         | Difficulty |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------- |
| [1. Social Login with Privy and zkSync Network](https://github.com/piatoss3612/LibroLink/tree/01.social-login)                       | dApp Core        | ★★☆☆☆      |
| [2. General Paymaster with custom features](https://github.com/piatoss3612/LibroLink/tree/02.general-paymaster)                      | zkSync Native AA | ★★★☆☆      |
| [3. Approval Flow Paymaster with dynamic fee calculation](https://github.com/piatoss3612/LibroLink/tree/03.approval-based-paymaster) | zkSync Native AA | ★★★★☆      |

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.10.0)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.22.21)
- [zksync-cli](https://docs.zksync.io/build/tooling/zksync-cli) (v1.7.1)

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

## Roadmap

### zkSync Native Account Abstraction Features

- [x] Sponsor gas fees with a general paymaster

### dApp core features

- [x] Implement social login with Privy and zkSync Network
- [ ] Create and record reading logs
- [ ] Create reading challenges and award system
- [ ] Implement a mission system

### Advanced Features

- [x] Gas fees payment in ERC20 tokens with an approval-based paymaster and price oracle
- (WIP)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributions

If you have any suggestions or improvements, feel free to create an issue or a pull request. This project is open for contributions. 🚀
