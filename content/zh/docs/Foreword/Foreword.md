---
title: "前序"
weight: 2
toc: false
tags: ["omnipaxos", "rust"]
---
OmniPaxos是一个基于Rust实现的分布式日志 (replicated log)库。OmniPaxos旨在隐藏共识的复杂性，为用户提供一个与本地日志一样简单易用的分布式日志。

与Raft类似，OmniPaxos可用于构建强一致性服务，如复制状态机。此外，与Raft相比，OmniPaxos的领导者选举(leader election)提供了更好的部分连接(partial connectivity)恢复能力和更灵活高效的重新配置。

该库由两个工作区组成：`omnipaxos`和`omnipaxos_storage`。`omnipaxos`将OmniPaxos的算法实现为普通的Rust结构体，您需要自己实现对应的网络传输模块(我们在[这里](omnipaxos/communication.md)描述了如何发送和处理消息)。您可以提供自己的实现来存储OmniPaxos的日志和状态，但我们也提供基于内存和基于持久存储的实现，它们可以在`OmniPaxos_storage`中开箱即用。

除了本教程中的演示外，OmniPaxos的用法示例也可以在[示例](https://github.com/haraldng/omnipaxos/tree/master/examples)和[测试](https://github.com/haraldng/omnipaxos/tree/master/tests)中找到。

