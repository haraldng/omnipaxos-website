---
title: "How OmniPaxos handles partial connectivity - and why other protocols can’t"
description: ""
excerpt: "Existing state machine replication protocols become unavailable with partial connectivity. OmniPaxos solves the problem by distilling a minimal set of requirements for becoming the leader which separates liveness and safety logic and adds the novel concept of quorum-connectivity to leader election."
date: 2023-05-03T16:20:54+02:00
lastmod: 2023-05-03T16:20:54+02:00
draft: false
weight: 50
images: []
categories: []
tags: []
contributors: ["Kevin Harrison"]
pinned: false
homepage: false
---

State machine replication (SMR) protocols such as Raft, VR, and MultiPaxos are widely used to build replicated services in the cloud. These protocols depend on a stable leader to make progress. However, as shown by the 6+ hour Cloudflare [outage](https://blog.cloudflare.com/a-byzantine-failure-in-the-real-world/) in 2020, partial connectivity can cause the leader election in these protocols to fail. In this post, we will explore what partial connectivity is, why existing algorithms fail under such conditions, and how OmniPaxos addresses this issue.

## What is partial connectivity?
Partial connectivity refers to a network failure where two servers become disconnected but both can still be reached by a third server. Such failures tend to occur due to [network upgrades](https://github.com/elastic/elasticsearch/issues/9495), firewall or network [misconfigurations](https://github.com/elastic/elasticsearch/issues/6105), or [unstable links between switches](https://issues.apache.org/jira/browse/MAPREDUCE-1800).

![Network errors](images/partition.svg)

This situation is distinct from the standard assumption of network partitions, where servers are either part of one partition or another. In partial connectivity, two connected servers may have differing views on the status of their peers. In the partial connectivity example, servers B-E all observe that server A is alive but are unaware of each other’s status. These inconsistent views can lead to serious issues where protocols become unable to progress. Let's examine these issues in three particular scenarios: the quorum-loss scenario, the constrained-election scenario, and the chained scenario

### Quorum-Loss Scenario

![Quorum-Loss scenario](images/quorum-loss.svg)

In the quorum-loss scenario, server C is initially able to correctly function as the leader since it's connected to a majority quorum. But after a network error, it is no longer connected to a quorum and therefore unable to commit any new entries. At this point, servers B, D, and E detect that they have lost connection to their leader C and initiate a new election, but they all fail to receive a majority of votes which is required for becoming leader. On the other hand, server A is connected to a quorum and potentially able to function as the leader. However, since it is still connected to its leader C, it will not initiate a new election to become the leader.

This results in a deadlock for protocols such as Raft and MultiPaxos where servers use the alive status of the leader to determine if an election should be initiated. Viewstamped Replication (VR) will also be deadlocked despite its round-robin election scheme. A server only votes for a leader (view) change if it observes a majority that also wants to do the same. This design originates in the classic assumption we showed earlier, where servers are fully connected within each partition. But here, it results in servers B-E not voting for a leader change as required.

**Key insight:** The leader’s alive-status alone is insufficient to determine leader change; the leader must also be quorum-connected. Furthermore, servers should be able to vote for another server as long as it is connected to it.

### Constrained-Election Scenario

![Constrained-Election scenario](images/constrained.svg)

The constrained-election scenario is similar to the quorum-loss scenario, but the leader C is now entirely partitioned from the rest. This time server A detects the need for a new leader and calls for a new election. However, at the time of the network error servers B and E had a more up-to-date log than A. This poses a problem for protocols like Raft, which require a server to have an up-to-date log to get votes. The network is again in a position where A must become the leader to make progress, however, A cannot be elected as its log is outdated, and it again results in a deadlock where no capable leader can take over.

**Key insight:** There must be no strict requirements to become a leader besides being quorum-connected.

### Chained Scenario

![Chained scenario](images/chained.svg)

In the chained scenario, C thinks that leader B has failed, and will try taking over leadership with a higher term number. Server A will adopt C’s higher term number and subsequently reject proposals from B. When A rejects B, it will include the current term number, and B will therefore get to know that it has been overtaken. After a while, B will timeout hearing from C and the described scenario will reoccur in the reversed direction; B will call for a new election with an even higher term number and regain leadership. This results in a livelock where the leader repeatedly changes due to servers having inconsistent views on who is alive and triggering new terms as soon as the leader is suspected to have failed.

**Key insight:** Gossiping the identity of the current leader can cause liveness issues.

## How OmniPaxos Addresses These Scenarios
OmniPaxos is the only SMR protocol that addresses all these scenarios. Unlike other protocols, Omni-Paxos completely separates the logic and state for leader election (liveness) from consensus (safety). Furthermore, OmniPaxos incorporates the novel concept of quorum-connectivity into the leader election process, which helps to address the three key insights gained from the three partial connectivity scenarios.

![table](images/table.png)

Ballot Leader Election (BLE) is the leader election protocol in OmniPaxos and provides resilience against partial connectivity by guaranteeing the election of a leader that can make progress, as long as such a candidate exists. In BLE, all servers periodically exchange heartbeats with one another. A server’s heartbeat consists of its ballot number and, importantly, a flag indicating its quorum-connected status. A server will then elect a leader that has the highest ballot but is also quorum-connected.

### OmniPaxos in the Quorum-Loss Scenario

![ql-omni](images/quorum-loss-omni.svg)

Due to the quorum-connected status flag, server A correctly identifies the need for a new leader despite still being connected to C. Server A then calls for a new election and, as it is the only quorum-connected server, wins.

### OmniPaxos in the Constrained-Election Scenario

![c-omni](images/constrained-omni.svg)

In this scenario, all the follower servers become disconnected from their leader and correctly call for a new election. The only server that is quorum-connected and can win the election is A. Server A is able to win the election because BLE doesn’t require server A to be up-to-date to become a leader, and servers B, E, D do not need to be connected to a majority to vote for it. Server A is elected and then syncs with its followers to become up-to-date before serving new requests.

### OmniPaxos in the Chained Scenario

![chained-omni](images/chained-omni.svg)

In the chained scenario, once again C detects the need for a new leader and, together with A’s vote, becomes the next leader. This time, however, the election of C is not gossiped to server B. This means that server B will not interrupt the stability of C’s leadership. Instead servers A and C can continue to make progress.

### Conclusion
The quorum-connected heartbeats of OmniPaxos’ BLE protocol allow it to overcome partial connectivity scenarios where other protocols fail. These heartbeats allow servers to determine their leader without being quorum connected themselves. This enables OmniPaxos to fully leverage the power of leader-based consensus. That is, OmniPaxos only requires one server connected to a majority to make progress, instead of a fully-connected majority required by other existing protocols.
