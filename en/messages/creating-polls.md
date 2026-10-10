---
title: Creating polls
icon: list-plus
description: Build a poll with its question, answers and duration, then post it alone or on a message.
tags: [messages, polls, builder]
syntaxes:
  - pollbuilder#new-poll
  - pollbuilder#poll-answer-drafts
  - pollanswerdata#new-answer
  - messageaction#attached-poll
order: 6
---

This page covers building a poll and sending it: on its own with `post` or `reply with`, or
attached to a message builder. Reading a poll back, ending it and its vote events are on the
[polls](doc:messages/polls) page. You're assumed to have a bot named `"my-bot"` logged in and to
know how [sending messages](doc:messages/sending-messages) works.

## How a poll is built

[`a new poll titled %string%`](syntax:pollbuilder#new-poll) creates a poll from its question.
Add its answers to [`poll answer drafts`](syntax:pollbuilder#poll-answer-drafts), then hand the
poll to [`post`](syntax:core/effects#post) or [`reply with`](syntax:core/effects#effect-reply-with)
like any other content. `with` and `asking` work in place of `titled`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lunch":
        set {_poll} to a new poll titled "Where do we eat?"
        add "Pizza", "Burgers" and "Sushi" to poll answer drafts of {_poll}
        post {_poll} to event-channel
```

A poll is not a builder in the [builder](doc:concepts/builders) sense: it has no
`build result of`, and sending it never needs `await`. It is checked when it is sent or
attached, so a poll with no answer fails on that line, not on the line that created it. The
poll that leaves is a copy: editing `{_poll}` afterwards changes nothing on Discord, and the same
poll can be posted twice.

syntax: pollbuilder#new-poll compact

## Options

| Property | Default | Accepted values |
| --- | --- | --- |
| [poll question](syntax:pollbuilder#poll-question) | the constructor's question | up to 300 characters |
| [poll answer drafts](syntax:pollbuilder#poll-answer-drafts) | none | 1 to 10 answers; `set`, `add`, `remove` |
| [poll duration](syntax:pollbuilder#poll-duration) | `24 hours` | from `1 hour` to `7 days` |
| [multi answer](syntax:pollbuilder#multi-answer) | `false` | `true`: voters may pick several answers |

Unlike most builders, these properties read back, so a script can check the poll before
sending it.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vote":
        set {_poll} to a new poll asking "Which features next?"
        add "Music" and "Levels" to poll answer drafts of {_poll}
        set poll duration of {_poll} to 3 days
        set multi answer of {_poll} to true
        reply with "%size of poll answer drafts of {_poll}% options, open for %poll duration of {_poll}%"
        reply with {_poll}
```

## Answers with an emoji

A plain text added to `poll answer drafts` becomes an answer without emoji. For an emoji, add
[`a new poll answer with text %string% with emoji %emote/string%`](syntax:pollanswerdata#new-answer)
instead: the emoji is a unicode emoji, an emote, or the `<:name:id>` form of a custom one.

```skript
set {_poll} to a new poll titled "Favorite food?"
add (a new poll answer with text "Pizza" with emoji "🍕") to poll answer drafts of {_poll}
add (a new poll answer with text "Sushi" with emoji "🍣") to poll answer drafts of {_poll}
remove "Pizza" from poll answer drafts of {_poll}
```

`remove` matches answers by their text, whether they were added as a text or as an answer
object. An answer object can still be changed through
[draft answer text](syntax:pollanswerdata#draft-answer-text) and
[draft answer emoji](syntax:pollanswerdata#draft-answer-emoji) before it is added; once added,
the poll holds its own copy.

syntax: pollanswerdata#new-answer compact

## Polls on a message builder

`post` and `reply with` forget the message they send. To keep it, to end the poll later or read
its voters, set [`attached poll`](syntax:messageaction#attached-poll) on a
[message builder](sending-messages.md#building-a-message) and build it: the poll goes
out with the message's content.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-kept":
        set {_poll} to a new poll titled "Ship it?"
        add "Yes" and "No" to poll answer drafts of {_poll}
        set {_m} to a new message with content "Release vote" in event-channel
        set attached poll of {_m} to {_poll}
        await set {_sent} to the build result of {_m}
        set {poll::release} to {_sent}
```

A message carries one poll at most: setting `attached poll` again replaces the previous one. A
poll cannot share a message with V2 components (containers, sections, text displays).

syntax: messageaction#attached-poll compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *a poll needs at least one answer* | The poll was sent with an empty `poll answer drafts` | Add answers before sending |
| *a poll holds at most 10 answers, this one has \<n>* | Too many answers | Remove some, or split into two polls |
| *a poll lasts between 1 hour and 168 hours (7 days), this one lasts \<n> hours* | `poll duration` is out of range | Pick a duration from 1 hour to 7 days |
| *the poll question is \<n> characters long, the maximum is 300* | The question is too long | Shorten it |
| *the poll answer "..." is \<n> characters long, the maximum is 55* | An answer is too long | Shorten it |

entity: pollbuilder
