---
title: "消息传递"
weight: 16
toc: false
---
如前所述，用户必须在服务器之间发送/接收消息。在本节中，我们将展示用户应该如何与`OmniPaxos`及其传入和传出的消息进行交互。

## 传入和传出
当从网络层接收到针对我们节点的消息时，我们需要在`OmniPaxos`中处理它。

```rust,edition2018,no_run,noplaypen
use omnipaxos::messages::Message;

// handle incoming message from network layer
let msg: Message<KeyValue, KVSnapshot> = ...;    // message to this node e.g. `msg.get_receiver() == 2`
omni_paxos.handle_incoming(msg);
```

通过处理传入消息和本地调用（如`append()`），我们的本地`omni_paxos`将为集群中的其他节点生成传出消息。因此，我们必须定期在网络层上发送传出的消息。

```rust,edition2018,no_run,noplaypen
// send outgoing messages. This should be called periodically, e.g. every ms
for out_msg in omni_paxos.outgoing_messages() {
    let receiver = out_msg.get_receiver();
    // send out_msg to receiver on network layer
}
```

> **注意**: 网络层，即如何实际发送和接收消息，需要由您（用户）来实现。您必须定期从`OmniPaxos`中获取这些需要传出的消息。

## 处理断开连接
OmniPaxos的主要优势之一是其对部分连接的恢复能力。如果一个节点失去与另一个节点的连接，然后重新连接（例如，在TCP会话断开之后），请确保在处理来自该节点的任何传入消息之前调用`reconnected(pid)`。

```rust,edition2018,no_run,noplaypen
// network layer notifies of reconnecting to peer with pid = 3
omni_paxos.reconnected(3);
...
```
