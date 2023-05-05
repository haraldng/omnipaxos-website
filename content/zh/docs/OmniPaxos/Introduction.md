---
title: "简介"
weight: 11
toc: false
---
OmniPaxos是一个普通的Rust结构体，因此用户需要自己提供一个网络传输模块来发送和接收消息。在本教程中，我们将展示用户应该如何与此结构体交互，以便实现强一致的分布式日志。本教程将重点介绍如何使用OmniPaxos库并展示其功能。

## 最前沿的版本
本教程基于GitHub上的'master'分支构建，因此往往比发布版的版本要超前一些。 如果您想在新功能发布之前尝试它们，可以将以下内容添加到您的'Cargo.toml'文件中:

```toml
omnipaxos = { git = "https://github.com/haraldng/omnipaxos", branch = "master" }
```

如果您需要最新的'master'的API文档，请在适当的位置（例如，另一个本地git存储库之外）运行以下命令：

```bash
git clone https://github.com/haraldng/omnipaxos
cd omnipaxos
cargo doc --open --no-deps
```
