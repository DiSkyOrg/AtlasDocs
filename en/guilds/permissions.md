---
title: Permissions
icon: shield-check
description: Read and change the permissions of roles, read what a member can do, and allow or deny permissions in one channel.
tags: [guild, role, member, channel, permissions]
syntaxes:
  - role#discord-permissions
  - member#discord-permissions
  - member#has-permission
  - core/expressions#expression-discord-permissions-in-channel
  - core/expressions#expression-channel-permission-override
order: 2
---

This page covers Discord permissions: the ones a role gives in the whole guild, the ones a member
ends up with, and the overrides a channel adds on top. You're assumed to have a bot named
`"my-bot"` logged in and a guild where it has **Manage Roles**.

## How permissions work

Discord decides what a member can do in two layers. The guild layer is the sum of the
permissions of the member's roles (and of `@everyone`). The channel layer is the channel's
permission overrides: for each role or member, a list of permissions the channel **allows** and a
list it **denies**, applied on top of the guild layer. Anything an override neither allows nor
denies is inherited from the guild layer. An administrator, and the guild owner, have every
permission everywhere.

Every syntax on this page carries the word `discord`: Skript already owns
`permissions of %player%` for Minecraft permissions, and its expression would win on an untyped
variable. A permission is written by its name (`view channel`, `kick members`, `administrator`)
or a friendly alias (`send messages`, `manage messages`, `embed links`); the
`permission` type lists them all.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!perms":
        set {_guild::*} to discord permissions of event-member
        set {_here::*} to discord permissions of event-member in event-channel
        reply with "Guild-wide: %{_guild::*}%. In this channel: %{_here::*}%."
```

## Role permissions

[`discord permissions of %role%`](syntax:role#discord-permissions) is the list set in the role
settings of the guild. `set`, `add` and `remove` change the role on Discord, and `delete` (or
setting it to nothing) leaves the role with no permission at all. `reset` is not accepted: a role
has no default to go back to.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!helper":
        set {_b} to a new role builder named "Helper" in event-guild
        await set {_role} to the build result of {_b}
        await set discord permissions of {_role} to send messages and embed links
        await add manage messages to discord permissions of {_role}
        remove embed links from discord permissions of {_role}
```

Without `await` the change is sent in the background and the next line still reads the old list;
with `await` the trigger waits for Discord to accept it. The role cache itself is refreshed when
Discord sends the update to the bot, usually a moment later, so read the list back after a short
`wait` if you need the new value. A whole list goes to Discord in one request, so
`add a and b to ...` costs one call.

syntax: role#discord-permissions compact

## Member permissions

[`discord permissions of %member%`](syntax:member#discord-permissions) is what the member
can do guild-wide: the permissions of all its roles combined, or all of them for the owner and an
administrator. It is read-only, because a member gets its permissions from its roles: change the
roles, or the role permissions, instead. Changing it is a parse error when Skript knows the value
is a member, and a readable error in the console when the member comes from an untyped variable.

To test a permission rather than list them, use
[`%members% have discord permissions %permissions%`](syntax:member#has-permission). It is true
only when the member has every permission given, and it takes the channel's overrides into
account when you add `in %guildchannel%`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear":
        if event-member has discord permission manage messages in event-channel:
            reply with "You may clean this channel."
        else:
            reply with "You need Manage Messages here."
```

syntax: member#has-permission compact

## Permissions in a channel

[`discord permissions of %member/role% in %guildchannel%`](syntax:core/expressions#expression-discord-permissions-in-channel)
is the result of both layers for one member or role in one channel: what it can really do there.
It is read-only. In a thread, the overrides of the parent channel apply, since a thread has none
of its own.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!can-talk":
        set {_p::*} to discord permissions of event-member in event-channel
        if {_p::*} contain send messages:
            reply with "You can talk here."
```

## Channel overrides

[`allowed discord permissions of %member/role% in %guildchannel%`](syntax:core/expressions#expression-channel-permission-override)
and its twin `denied discord permissions of ...` are the two lists of one override. Both are
empty when the channel has no override for that role or member. Changing them creates the
override when needed.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lock":
        set {_everyone} to everyone role of event-guild
        await add send messages to denied discord permissions of {_everyone} in event-channel
        await add send messages to allowed discord permissions of event-member in event-channel
        reply with "Channel locked, except for you."
```

The two lists never share a permission, which decides how each change behaves:

| Change | On `allowed` | On `denied` |
| --- | --- | --- |
| `add` | Allows them, and takes them out of `denied` | Denies them, and takes them out of `allowed` |
| `remove` | Clears them from `allowed` only: they are inherited again, not denied | Clears them from `denied` only: they are inherited again, not allowed |
| `set` | Allows exactly these; the ones that were denied stop being denied | Denies exactly these; the ones that were allowed stop being allowed |
| `reset`, `delete` | Removes the whole override, `allowed` and `denied` together | Same |

`reset allowed discord permissions of {_role} in event-channel` puts the channel back to the guild
layer for that role. Removing every permission one by one leaves an empty override on the channel
instead; it does nothing, but it stays listed in the channel settings until you reset it.

!!! warning "Threads use their parent's overrides"
    A thread has no override of its own. Changing an override with a thread as the channel
    changes the override of its parent channel, for every thread of that channel.

Like a property, an override change runs in the background without `await` and waits for Discord
with it.

syntax: core/expressions#expression-channel-permission-override compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Cannot perform action due to a lack of Permission. Missing permission: MANAGE_ROLES* | The bot cannot edit roles | Give the bot **Manage Roles** |
| *Cannot perform action due to a lack of Permission. Missing permission: MANAGE_PERMISSIONS* | The bot cannot edit the overrides of this channel | Give the bot **Manage Roles** guild-wide, or **Manage Permissions** in the channel |
| *Cannot perform action due to a lack of Permission. Missing permission: ...* naming another permission | The bot tried to give, allow or deny a permission it does not have itself | Give that permission to the bot first, or leave it out |
| *Cannot modify a role that is higher or equal in hierarchy* | The role sits at or above the bot's highest role | Move the bot's role above it |
| *the discord permissions of a member cannot be changed* | A `set`, `add` or `remove` on a member's guild permissions | Change its roles, or a channel override |
