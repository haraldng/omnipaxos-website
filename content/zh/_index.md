---
title : "OmniPaxos"
description: "OmniPaxos is a distributed log library in Rust."
lead: "OmniPaxos is a distributed log library in Rust."
date: 2020-10-06T08:47:36+00:00
lastmod: 2020-10-06T08:47:36+00:00
draft: false
images: []
---

## 宗旨
OmniPaxos 是一个软件库，旨在简化分布式系统的复制和容错，这在构建高可用服务时是一个具有挑战性的任务。我们的目标是通过提供完整的工具和抽象来赋能开发者，从而使得构建可靠、容错和一致的系统变得更加容易。通过 OmniPaxos，开发者不再需要担心复制和一致性算法 (consensus) 的复杂性；我们提供了一个 API，使得复制变得像操作仅追加日志一样简单。

### 功能亮点
