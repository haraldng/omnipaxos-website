---
title: "快速开始"
weight: 4
toc: false
---
我们的目标是很快在`crates`上发布，但目前，使用OmniPaxos最简单的方法是将其作为GitHub依赖项。

<!-- ## Setting up Rust
It is recommended to run OmniPaxos on a *nightly* version of the Rust toolchain.

We recommend using the [rustup](https://rustup.rs/) tool to easily install the latest nightly version of rust and keep it updated. Instructions should be on the screen once rustup is downloaded.

> **Using the nightly toolchain:** Rustup can be configured to default to the nightly toolchain by running `rustup default nightly`. 

## Cargo

Add OmniPaxos to your cargo project as a dependency:

```toml
[dependencies]
omnipaxos = "LATEST_VERSION"
```
The latest version can be found on [crates.io](https://crates.io/crates/omnipaxos). -->

### Github

<!--You can also point cargo to the latest [Github](https://github.com/haraldng/omnipaxos) master version, instead of a release.  -->
请将以下内容添加到您的Cargo.toml中：

```toml
[dependencies]
omnipaxos_core = { git = "https://github.com/haraldng/omnipaxos" }
```

在`omnipaxos_core/examples/kv_store`中, 我们展示了一个如何基于tokio使用OmniPaxos复制KV的示例。