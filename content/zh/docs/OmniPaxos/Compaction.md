---
title: "压缩"
weight: 22
toc: falsesuo
---
随着时间的推移，`OmniPaxos`中复制的日志将变得越来越大。为了避免日志无限增长，我们支持用户可以启动的两种压缩方式：

## 切割
切割日志会删除某个索引之前的所有项。由于项是从日志中删除的，因此只有当集群中的**所有**节点已决定到该索引时，才能执行切割操作。例子：

```rust,edition2018,no_run,noplaypen
use omnipaxos::sequence_paxos::CompactionErr;

// we will try trimming the first 100 entries of the log.
let trim_idx = Some(100);  // using `None` will use the highest trimmable index
match omni_paxos.trim(trim_idx) {
    Ok(_) => {
        // later, we can see that the trim succeeded with `omni_paxos.get_compacted_idx()`
    }
    Err(e) => {
        match e {
            CompactionErr::NotAllDecided(idx) => {
                // Our provided trim index was not decided by all servers yet. All servers have currently only decided up to `idx`.
                // If desired, users can retry with omni_paxos.trim(Some(idx)) which will then succeed.
            }
            ...
        }
    }
}
```

> **注意**: 请确保您的应用程序不再需要将要切割的数据。一旦成功，切割后的条目将丢失，无法读取或恢复。

## 快照
切割会压缩日志并丢弃切割索引之前的任何数据。因此，为了安全起见，它要求所有服务器都已决定切割索引。如果您不想丢弃任何数据，并且日志中的项可以压缩到快照中，`OmniPaxos`支持对日志中已决定的项进行快照。例如，在我们的键值存储示例中，我们不需要保留每个更改键值对的日志项。相反，如果我们想快照日志，那么保留每个键的最新值就足够了。我们将快照实现为一个名为`KVSnapshot`的结构，它只是`HashMap`的包装器，该包装器将保存日志中每个键的最新值。为了使其与`OmniPaxos`一起工作，我们需要为`KVSnapshot`实现特性`Snapshot`：

```rust,edition2018,no_run,noplaypen
use std::collections::HashMap;
use omnipaxos::storage::Snapshot;

#[derive(Clone, Debug)]
pub struct KVSnapshot {
    snapshotted: HashMap<String, u64>
}

impl Snapshot<KeyValue> for KVSnapshot {
    fn create(entries: &[KeyValue]) -> Self {
        let mut snapshotted = HashMap::new();
        for e in entries {
            let KeyValue { key, value } = e;
            snapshotted.insert(key.clone(), *value);
        }
        Self { snapshotted }
    }

    fn merge(&mut self, delta: Self) {
        for (k, v) in delta.snapshotted {
            self.snapshotted.insert(k, v);
        }
    }

    fn use_snapshots() -> bool {
        true
    }
}
```

`create()`函数告诉`OmniPaxos`如何在给定`KeyValue`类型的条目切片的情况下创建快照。在我们的例子中，我们只想将键值对插入到哈希表中。`merge()`函数定义了如何合并两个快照。在我们的情况下，我们将只插入/更新另一个快照中的键值。`use_snapshots()`函数告诉`OmniPaxos`是否应该在协议中使用快照。

使用`KVSnapshot`，我们将按如下方式创建`OmniPaxos`节点：

```rust,edition2018,no_run,noplaypen
// ...same as shown before in the `OmniPaxos` chapter.
let storage = MemoryStorage::<KeyValue, KVSnapshot)>::default();    // use KVSnapshot as type argument instead of ()
let mut omni_paxos = omni_paxos_config.build(storage);
```
我们现在可以创建快照并从`OmniPaxos`中读取快照。此外，快照允许我们只在本地执行快照，或者使用布尔参数`local_only`请求集群中的所有节点执行快照。
```rust,edition2018,no_run,noplaypen
// we will try snapshotting the first 100 entries of the log.
let snapshot_idx = Some(100);  // using `None` will use the highest snapshottable index
let local_only = false; // snapshots will be taken by all nodes.
match omni_paxos.snapshot(snapshot_idx, local_only) {
    Ok(_) => {
        // later, we can see that the snapshot succeeded with `omni_paxos.get_compacted_idx()`
    }
    Err(e) => {
        match e {
            CompactionErr::UndecidedIndex(idx) => {
                // Our provided snapshot index is not decided yet. The currently decided index is `idx`.
            }
            ...
        }
    }
}

// reading a snapshotted entry
if let Some(e) = omni_paxos.read(20) {
    match e {
        LogEntry::Snapshotted(s) => {
            // entry at idx 20 is snapshotted since we snapshotted idx 100
            let snapshotted_idx = s.trimmed_idx;
            let snapshot: KVSnapshot = s.snapshot;
            // ...can query the latest value for a key in snapshot
        }
        ...
}
```

> **注意**: 如果`Entry`类型不是snapshottable，只需使用 `()`作为`Snapshot`的类型参数即可。
