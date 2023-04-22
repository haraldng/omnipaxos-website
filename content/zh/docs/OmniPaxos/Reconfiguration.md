---
title: "重新配置"
weight: 24
toc: false
---
要更改集群中的节点，我们必须首先停止当前的OmniPaxos实例。这是通过`reconfiguration()`函数完成的，该函数有一个`ReconfigurationRequest`，其中包含下一个OmniPaxos实例的节点和一些可选元数据。

```rust,edition2018,no_run,noplaypen
// Node 3 seems to have crashed... let's replace it with a new node 4.
let new_configuration = vec![1, 2, 4];
let metadata = None;
let rc = ReconfigurationRequest::with(new_configuration, metadata);
omni_paxos.reconfigure(rc).expect("Failed to propose reconfiguration");
```

调用`reconfigure()`将发出提议附加一个`StopSign`条目。如果决定了，日志将被封存，并防止被进一步追加。从`StopSign`条目中，所有节点都可以看到新配置。当用户从节点中读取并在日志中找到`LogEntry::StopSign`时，如果它也是新配置的一部分，则应在此节点启动一个新的`OmniPaxos`实例。

```rust,edition2018,no_run,noplaypen
let idx: u64 = ...  // some index we last read from
    let decided_entries: Option<Vec<LogEntry<KeyValue, KVSnapshot>>> = seq_paxos.read_decided_suffix(idx);
    if let Some(de) = decided_entries {
        for d in de {
            match d {
                LogEntry::StopSign(stopsign) => {
                    let new_configuration = stopsign.nodes;
                    if new_configuration.contains(&my_pid) {
                    // we are in new configuration, start new instance
                        let mut new_op_conf = OmniPaxosConfig::default();
                        new_sp_conf.set_configuration_id(stopsign.config_id);
                        let new_storage = MemoryStorage::default();
                        let mut new_op = new_op_conf.build(new_storage);
                        
                        ... // use new_sp
                    }
                }
                _ => {
                    todo!()
                }
            }
        }
    }
```

> **注意**: 新节点将看不到`StopSign`，因为它们不是旧配置的一部分。用户自己必须通知并启动这些新节点。此外，用户必须确保这些新节点在启动其`OmniPaxos`实例之前具有应用程序状态或在停止符之前的所有日志。