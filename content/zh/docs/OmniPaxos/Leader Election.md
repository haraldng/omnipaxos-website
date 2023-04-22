---
title: "选举协议"
weight: 20
toc: false
---
# Ballot选举协议
OmniPaxos的一个独特功能是使用Ballot选举协议（BLE），通过一台连接法定人数的服务器保证进程推进。在本节中，我们将看到选举协议在OmniPaxos中是如何使用的。

要检测任何领导者故障并选择新的领导者，必须定期（例如，每100ms）调用函数`election_timeout()`。

```rust
// Call this periodically
omni_paxos.election_timeout();
```

如果领导者失败，将在一次选举超时中检测到，并在下一次超时中选出新的领导者（如果可行的话）。

> **注意：**`OmniPaxosConfig`中的`leader_priority`字段允许用户在更换领导者时为所需服务器提供更高的优先级以供选择。
