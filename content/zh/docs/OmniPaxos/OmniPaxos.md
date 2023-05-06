---
title: "OmniPaxos"
weight: 12
toc: false
---
集群中的每个服务器都应该有一个`OmniPaxos`结构体的本地实例。`OmniPaxos`维护分布式日志的本地状态，处理传入消息并生成传出消息，用户必须使用其网络实现来获取和发送这些消息。用户还需通过`OmniPaxos`访问日志。为了本教程的方便，我们将使用一些开箱即用的宏和存储实现。这需要我们修改`Cargo.toml`:

```toml
[dependencies]
omnipaxos = { version = "LATEST_VERSION", features = ["macros"] }
omnipaxos_storage = "LATEST_VERSION"
```

## 示例: 键值存储
作为本教程的指南，我们将使用OmniPaxos来实现分布式日志，以构建一致的键值存储。
我们首先定义我们希望日志项包含的类型：

```rust,edition2018,no_run,noplaypen
#[derive(Clone, Debug)] // Clone and Debug are required traits.
pub struct KeyValue {
    pub key: String,
    pub value: u64,
}
```

## 新建一个节点
定义了日志项和存储的结构后，我们现在可以继续创建`OmniPaxos`副本实例。假设我们希望在三台服务器上复制键值存储。在节点2上，我们将执行以下操作：

```rust,edition2018,no_run,noplaypen
use omnipaxos::{OmniPaxos, OmniPaxosConfig};
use omnipaxos_storage::{
    memory_storage::MemoryStorage,
};

// configuration with id 1 and the following cluster
let configuration_id = 1;
let cluster = vec![1, 2, 3];

// create the replica 2 in this cluster (other replica instances are created similarly with pid 1 and 3 on the other nodes)
let my_pid = 2;
let my_peers = vec![1, 3];

let omnipaxos_config = OmniPaxosConfig {
    configuration_id,
    pid: my_pid,
    peers: my_peers,
    ..Default::default()
}

let storage = MemoryStorage::<KeyValue, ()>::default();
let mut omni_paxos = omnipaxos_config.build(storage);
```
为了方便起见，`OmniPaxosConfig` 还提供了一个构造函数`OmniPaxosConfig::with_toml()`，该构造函数使用[TOML](https://toml.io), 用户可以将参数保存在文件`config/node1.toml`中。

```toml
configuration_id = 1
pid = 2
peers = [1, 3]
logger_file_path = "/omnipaxos/logs"
```
这些参数被加载后可以用来构建`OmniPaxosConfig`:

```rust,edition2018,no_run,noplaypen
let config_file_path = "config/node1.toml";
let omnipaxos_config = OmniPaxosConfig::with_toml(config_file_path);
```

## 故障恢复

为了支持故障恢复，我们必须确保存储的实现能够持久化日志项和存储状态。恢复后，我们必须确保我们的`OmniPaxos`将从之前的持久状态开始。为此，我们首先使用与上一个实例相同的存储路径重新创建存储。然后我们创建一个`OmniPaxos`实例，但使用持久状态作为`storage`参数。最后，我们调用`fail_recovery()`来正确初始化易变状态。我们使用[`PersistentStorage`](storage.md#persistentstorage)进行示例。

```rust,edition2018,no_run,noplaypen
/* Re-creating our node after a crash... */

// Configuration from previous storage
let my_path = "/my_path_before_crash/";
let my_log_opts = LogOptions::new(my_path);
let persist_conf = PersistentStorageConfig::default();

persist_conf.set_path(my_path); // set the path to the persistent storage
my_config.set_commitlog_options(my_logopts);

// Re-create storage with previous state, then create `OmniPaxos`
let recovered_storage = PersistentStorage::open(persist_conf);
let mut recovered_paxos = omnipaxos_config.build(recovered_storage);
recovered_paxos.fail_recovery();
```
