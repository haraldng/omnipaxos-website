---
title: "日志记录"
weight: 26
toc: false
---
OmniPaxos使用[slog](https://crates.io/crates/slog)库提供全系统的日志记录实现。日志记录使用默认的异步控制台和文件记录器实现开箱即用。

实际的日志记录级别通过构建功能进行控制。默认功能对应于`max_level_trace`和`release_max_level_info`，即在调试构建中显示所有级别，而在发布配置文件中只显示`info`和更严重的消息。

## 自定义Logger

有时，默认的日志记录配置对于特定的应用程序来说是不够的。例如，您可能需要在`Async`输出中使用更大的队列大小，或者您可能希望写入文件而不是终端。
用户可以提供基于[**slog**](https://crates.io/crates/slog)的自定义实现。