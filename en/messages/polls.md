---
title: Polls
icon: vote
description: Read a poll attached to a message, list its voters, end it early, and react when someone votes.
tags: [messages, polls]
syntaxes:
  - message#poll
  - message#end-poll
  - messagepoll#poll-answers
  - core/expressions#expression-poll-voters
order: 7
---

This page covers a poll that is already on Discord: read its question and answers, list who
voted, end it before its deadline, and react to votes as they come in. Sending one is covered in
[creating polls](doc:messages/creating-polls). You're assumed to have a bot named `"my-bot"`
logged in and to know how to [read a message](doc:messages/managing-messages).

## How polls work

[`has a poll`](syntax:message#a-poll) tells you whether a message carries one; when it does,
[`poll of`](syntax:message#poll) the message gives back a `messagepoll` with a `poll question`
and a list of `poll answers`, along with [multi answer](syntax:messagepoll#multi-answer),
[poll layout](syntax:messagepoll#poll-layout) and
[poll expiration date](syntax:messagepoll#poll-expiration-date).

```skript
on message received seen by "my-bot":
    if event-message has a poll:
        set {_poll} to poll of event-message
        reply with "%poll question of {_poll}%"
        loop poll answers of {_poll}:
            reply with "%answer text of loop-value%: %answer votes of loop-value% votes"
```

## Answers

Each element of `poll answers` is a `pollanswer`.

| Property | Returns |
| --- | --- |
| [answer text](syntax:pollanswer#answer-text) | the option's text |
| [answer votes](syntax:pollanswer#answer-votes) | the number of votes it has, as a plain number |
| [answer emote](syntax:pollanswer#answer-emote) | the emoji shown next to it, if the poll has one; none otherwise |
| [answer id](syntax:pollanswer#answer-id) | its number, from 1 in the order the answers were declared |
| [answer self voted](syntax:pollanswer#answer-self-voted) | whether the bot itself voted for it |

`answer votes` never needs `await`: the count travels with the message itself, not a separate
fetch. `answer emote` prints as the emoji itself, so it can go straight into a message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-winner":
        set {_poll} to poll of event-message
        set {_best} to first element of (poll answers of {_poll})
        loop poll answers of {_poll}:
            if answer votes of loop-value > answer votes of {_best}:
                set {_best} to loop-value
        reply with "leading: %answer text of {_best}% (%answer votes of {_best}%)"
```

## Listing voters

[`voters of poll answer %number/pollanswer% of %message%`](syntax:core/expressions#expression-poll-voters)
lists the users who picked one answer. The answer is a `pollanswer` or its `answer id`; the
message is the one carrying the poll, not the poll itself. The list is fetched from Discord, every
page of it, so the line requires `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!voters":
        set {_m} to {poll::release}
        loop poll answers of (poll of {_m}):
            await set {_voters::*} to the voters of poll answer loop-value of {_m}
            reply with "%answer text of loop-value%: %{_voters::*}%"
            delete {_voters::*}
```

`{poll::release}` holds a message sent from a [message builder](doc:messages/creating-polls),
the only way to keep the poll's message. An answer number the poll does not have is a readable
error (*this poll has no answer numbered \<n>*).

syntax: core/expressions#expression-poll-voters compact

## Ending a poll

[`end the poll of`](syntax:message#end-poll) closes a poll before its deadline; nobody can
vote on it after this runs.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!end-poll":
        end the poll of event-message
```

[`is expired`](syntax:messagepoll#expired) is true once the poll's deadline has passed and no
more votes are accepted; [`is finalized`](syntax:messagepoll#finalized) is true once Discord
has settled the vote counts as definitive, which `end the poll of` also does immediately.
`end the poll of` refuses a message with no poll, and a poll that is already expired or
finalized.

syntax: message#end-poll compact

## Vote events

[`on message poll vote added`](event:events#poll-vote-add) and
[`on message poll vote removed`](event:events#poll-vote-remove) fire per vote. `event-message`,
`event-member` and `event-user` are fetched from Discord before the trigger starts, so none of
them need `await` (see [cache and await](doc:concepts/cache-and-await)); `event-member` is none
for a vote cast in a DM.

| Event | Values |
| --- | --- |
| `on message poll vote added` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |
| `on message poll vote removed` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |

```skript
on message poll vote added seen by "my-bot":
    send "%event-user% voted on a poll in %event-channel%" to console
```

Neither event says which answer was voted on: only who voted, and on which message. Read the
[voters](#listing-voters) of each answer if you need to know which option changed.

event: events#poll-vote-add compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *IllegalStateException: this message carries no poll* | `end the poll of` was called on a message with no poll attached | Check [`has a poll`](syntax:message#a-poll) first |
| *IllegalStateException: this poll is already over* | `end the poll of` was called on a poll that is already expired or finalized | Check `is expired`/`is finalized` before calling it, or only call it once |

entity: messagepoll
