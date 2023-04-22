---
title: "读和写"
weight: 18
toc: false
---
我们现在展示如何读取和写入复制的日志。注意是 *仅追加* 的。要附加日志项，我们调用以下命令：

```rust,edition2018,no_run,noplaypen
let write_entry = KeyValue { key: String::from("a"), value: 123 };

omni_paxos.append(write_entry).expect("Failed to append");
```

这将导致我们的`write_entry`被提议在分布式日志中决定。可以对追加进行流式处理，而无需等待前面的项被决定。此外，`append()`可以在任何节点上调用。如果调用节点不是领导者，则该条目将被转发。

## 读取日志
读取也是通过调用`OmniPaxos`上的各种函数来处理的。要读取日志特定索引`idx`处的项，需调用`omni_paxos.read_entry(idx)`。我们还可以使用`omni-paxos.read_entries()`读取特定范围的日志项。 

```rust,edition2018,no_run,noplaypen
/*** Read a single entry ***/
let idx = 5;
let read_entry = omni_paxos.read(idx);

/*** Read a range ***/
let read_entries = omni_paxos.read_entries(2..5);
```

读取函数分别返回`Option＜LogEntry＞`和`Option＜Vec＜LogEntry>`，其中如果索引或范围超出范围，则返回`None`。`LogEntry `是一个具有以下变体的枚举：

- `Decided(T)`：该日志项已决定并保证不会被撤销。因此，将已决定的项应用于应用程序状态是安全的。例如，在我们的案例中，当我们读取`Decided(KeyValue)` 项时，更新键值存储是安全的。

- `Undecided(T)`：该项未确定，以后可能会从日志中删除。然而，举个例子，它在允许推测执行的应用程序中可能很有用。

- `Trimmed(TrimmedIndex)`：我们试图读取一个条目已经被修剪的索引。

- `Snapshotted(SnapshottedEntry<T, S>)`：我们读取的索引已经压缩到快照中。我们可以从`SnapshottedEntry`中的字段`snapshot`访问快照。在我们的案例中，这将对应于我们定义的[`KVSnapshot`](../compacting.md)。

- `StopSign(StopSign)`：此Sequence Paxos实例已停止以进行重新配置。这意味着这个日志将不再被附加，应该使用新的Sequence Paxos进行写入。

也可以使用`read_decided_suffix(idx)`仅从特定索引中读取已决定的条目或快照。

