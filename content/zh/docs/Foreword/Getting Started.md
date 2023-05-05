---
title: "快速开始"
weight: 4
toc: false
---
## Cargo
将OmniPaxos作为您的cargo项目的依赖项添加：
```toml
[dependencies]
omnipaxos = "LATEST_VERSION"
```
您可以在[crates](https://crates.io/crates/omnipaxos)上找到最新版本。

### Github

您还可以将 cargo 指向最新的 Github master 版本。请将以下内容添加到您的Cargo.toml中：

```toml
[dependencies]
omnipaxos = { git = "https://github.com/haraldng/omnipaxos" }
```

在`omnipaxos/examples/kv_store`中, 我们展示了一个如何基于tokio使用OmniPaxos复制KV的示例。

## 文档
除了本教程，API文档可以在 [https://docs.rs/omnipaxos](https://docs.rs/omnipaxos) 上找到。
