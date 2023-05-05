---
title: "存储"
weight: 14
toc: false
---
您可以自由地将任何存储实现与`OmniPaxos`一起使用。唯一的要求是实现`Storage`特性。OmniPaxos包括`omnipaxos_storage`包，它提供了两种开箱即用的存储实现：`MemoryStorage`和`PersistentStorage`。

## 引入`omnipaxos_storage`
要使用提供的存储实现，我们需要将`omnipaxos_storage`添加到cargo的依赖项中。您可以在[crates](https://crates.io/crates/omnipaxos_storage)上找到最新版本。
```rust,edition2018,no_run,noplaypen
[dependencies]
omnipaxos_storage = { version = "LATEST_VERSION", default-features = true }
```

**如果**您**确实**决定实现自己的存储模块，我们建议您将`MemoryStorage`作为实现`Storage`所需功能的参考。

## MemoryStorage
`MemoryStorage`是一个内存存储实现，它将在我们的示例中使用。为了简单起见，我们暂时省略了实现的一些部分(例如[快照](../compaction.md))。

```rust,edition2018,no_run,noplaypen
    // from the module omnipaxos_storage::memory_storage
    #[derive(Clone)]
    pub struct MemoryStorage<T, S>
    where
        T: Entry,
        S: Snapshot<T>,
    {
        /// Vector which contains all the replicated entries in-memory.
        log: Vec<T>,
        /// Last promised round.
        n_prom: Ballot,
        /// Last accepted round.
        acc_round: Ballot,
        /// Length of the decided log.
        ld: u64,
        ...
    }

    impl<T, S> Storage<T, S> for MemoryStorage<T, S>
    where
        T: Entry,
        S: Snapshot<T>,
    {
        fn append_entry(&mut self, entry: T) -> u64 {
            self.log.push(entry);
            self.get_log_len()
        }

        fn append_entries(&mut self, entries: Vec<T>) -> u64 {
            let mut e = entries;
            self.log.append(&mut e);
            self.get_log_len()
        }

        fn append_on_prefix(&mut self, from_idx: u64, entries: Vec<T>) -> u64 {
            self.log.truncate(from_idx as usize);
            self.append_entries(entries)
        }

        fn set_promise(&mut self, n_prom: Ballot) {
            self.n_prom = n_prom;
        }

        fn set_decided_idx(&mut self, ld: u64) {
            self.ld = ld;
        }

        fn get_decided_idx(&self) -> u64 {
            self.ld
        }

        fn set_accepted_round(&mut self, na: Ballot) {
            self.acc_round = na;
        }

        fn get_accepted_round(&self) -> Ballot {
            self.acc_round
        }

        fn get_entries(&self, from: u64, to: u64) -> Vec<T> {
            self.log
                .get(from as usize..to as usize)
                .unwrap_or(&[])
                .to_vec()
        }

        fn get_log_len(&self) -> u64 {
            self.log.len() as u64
        }

        fn get_suffix(&self, from: u64) -> Vec<T> {
            match self.log.get(from as usize..) {
                Some(s) => s.to_vec(),
                None => vec![],
            }
        }

        fn get_promise(&self) -> Ballot {
            self.n_prom
        }
        ...
    }
```

## PersistentStorage
`PersistentStorage`是一个持久化存储实现，用于存储复制的日志和OmniPaxos的状态。本模块使用[Commitlog](https://crates.io/crates/commitlog)存储复制的日志, 同时系统状态的存储默认使用[sled](https://crates.io/crates/sled)。可以使用特性`rocksdb`将系统状态的存储更改为使用[RocksDB](https://crates.io/crates/rocksdb) 而非sled。用户可以通过`PersistentStorageConfig`配置日志项的路径、OmniPaxos状态以及与存储相关的选项。配置结构具有一个用于生成默认配置的`default()`构造函数，以及一个将存储路径和选项作为参数的构造函数`with()`。

```rust,edition2018,no_run,noplaypen
use omnipaxos_core::{
    sequence_paxos::{OmniPaxos, OmniPaxosConfig},
};
use omnipaxos_storage::{
    persistent_storage::{PersistentStorage, PersistentStorageConfig},
};
use commitlog::LogOptions;
use sled::{Config};

// user-defined configuration
let my_path = "my_storage"
let my_log_opts = LogOptions::new(my_path);
let mut my_sled_opts = Config::new();
my_sled_opts.path(self, my_path);

// generate default configuration and set user-defined options
let mut my_config = PersistentStorageConfig::default();
my_config.set_path(my_path);
my_config.set_commitlog_options(my_logopts);
my_config.set_sled_options(my_sled_opts);
```
同样的配置也可以用接受参数的构造函数来完成：
```rust,edition2018,no_run,noplaypen
let my_path = "another_storage"
let my_logopts = LogOptions::new(my_path);
let mut my_sled_opts = Config::new();
my_sled_opts.path(my_path);
my_sled_opts.new(true);

// create configuration with given arguments
let my_config = PersistentStorageConfig::with(my_path, my_logopts, my_sled_opts);
```
