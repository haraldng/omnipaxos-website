---
title: "简介"
weight: 11
toc: false
---
OmniPaxos是一个普通的Rust结构体，因此用户需要自己提供一个网络传输模块来发送和接收消息。在本教程中，我们将展示用户应该如何与此结构体交互，以便实现强一致的分布式日志。本教程将重点介绍如何使用OmniPaxos库并展示其功能。

<!-- For the properties and advantages of OmniPaxos in comparison to other similar protocols, we refer to the Omni-Paxos paper. -->