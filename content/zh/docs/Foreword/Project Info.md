---
title: "项目信息"
weight: 8
toc: false
---
尽管OmniPaxos主要开发于瑞典斯德哥尔摩的[瑞典皇家理工大学](https://www.kth.se/en)和[瑞典研究院](https://www.ri.se/en), 我们依旧想要感谢各位[贡献者](https://github.com/haraldng/omnipaxos/graphs/contributors)。

<!-- ## Releases

OmniPaxos releases are hosted on [crates.io](https://crates.io/crates/omnipaxos). -->

<!-- ## API Documentation

OmniPaxos API docs are hosted on [docs.rs](https://docs.rs/kompact/latest/kompact/). -->

## 源代码 & Issues

OmniPaxos的源代码可以在[Github](https://github.com/haraldng/omnipaxos)中找到。

所有与OmniPaxos相关的问题和请求都应发布于此。

<!---

## Bleeding Edge

This tutorial is built off the `master` branch on GitHub and thus tends to be a bit ahead of what is available in a release.
If you would like to try out new features before they are released, you can add the following to your `Cargo.toml`:

```toml
omnipaxos_core = { git = "https://github.com/haraldng/omnipaxos", branch = "master" }
```
--->

### 文档

如果您需要最新的API文档，请在适当的位置（例如，在另一个本地git存储库之外）运行以下内容：

```bash
git checkout https://github.com/haraldng/omnipaxos
cd omnipaxos
cargo doc --open --no-deps
```
