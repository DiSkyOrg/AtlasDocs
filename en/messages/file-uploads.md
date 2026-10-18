---
title: File uploads
icon: paperclip
description: Build a file from a local path, a url or a received attachment, attach it to a message, and read attachments back.
tags: [messages, files, attachments]
syntaxes:
  - core/expressions#expression-new-file-upload
  - messageaction#attachments
  - message#discord-attachments
order: 3
---

This page covers sending files: building a file upload from a local path, a url or a received
attachment, attaching it to a message builder, and reading the attachments of a sent message.
You're assumed to have a bot named `"my-bot"` logged in and to know how to
[send a message](doc:messages/sending-messages).

## How uploads work

[A new file upload](syntax:core/expressions#expression-new-file-upload) wraps a source into a
local object, added to a [message builder](doc:concepts/builders)'s `attachments` before it is
sent. Four sources build one, chosen by the words after `from`:

| Source | Pattern | Notes |
| --- | --- | --- |
| Local file | `from [local] file %string%` | Path is resolved against the server's working directory; DiSky checks the file exists right away. |
| URL | `from ur(l|i) %string%` | Downloaded only when the message is sent, never at creation. |
| Attachment | `from attachment %attachment%` | Re-uploads a received attachment; also downloaded at send time. |
| Image | `from image %image%` | Only registered when the SkImage2 add-on is installed; the image is encoded to PNG right away, since it only exists in memory. |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-local":
        set {_f} to a new file upload from file "plugins/DiSky/logo.png"
        set {_m} to a new message with content "here's the logo" in event-channel
        add {_f} to attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Nothing is read from disk or downloaded until the message carrying the upload is actually sent,
except the local file's existence check and the image encoding above, which both have to happen
now since there's nothing to defer.

syntax: core/expressions#expression-new-file-upload compact

## Naming and spoilers

Every constructor takes an optional `named` (or `with the name`) and `with spoiler`. Left out,
the name defaults to the source's own: the local file's or attachment's file name, the url's
last path segment (or `"file"` if it has none), or `image-<hex>.png` for an image.

```skript
set {_f} to a new file upload from url "https://example.com/logo.png" named "banner.png" with spoiler true
```

`with spoiler true` and [`set spoiler of {_f}`](syntax:fileupload#spoiler) both work by
prefixing the name with `SPOILER_`; setting it back to `false` strips the prefix again. Because
the check looks at the current name, rename the file before setting `spoiler`, not after, or the
rename overwrites the prefix. [`file description`](syntax:fileupload#file-description) sets the
alt text shown by screen readers and on hover; it has no readable side, only a setter.

```skript
set {_f} to a new file upload from file "plugins/DiSky/logo.png"
set file name of {_f} to "company-logo.png"
set spoiler of {_f} to true
set file description of {_f} to "the company logo"
```

## Attaching to a message

[`attachments`](syntax:messageaction#attachments) of a [message builder](doc:concepts/builders)
takes `set`, `add` and `remove`; reading it back gives the names of the files added so far, and
`remove` takes a name rather than the upload itself.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-list":
        set {_a} to a new file upload from file "plugins/DiSky/logo.png" named "a.png"
        set {_b} to a new file upload from file "plugins/DiSky/logo.png" named "b.png"
        set {_m} to a new message with content "one file" in event-channel
        set attachments of {_m} to {_a} and {_b}
        remove "a.png" from attachments of {_m}
        await set {_sent} to the build result of {_m}
```

A url or attachment source is only downloaded once `the build result of` runs, so a dead url
fails there, not on the `add` line. `reply with {_m} with reference event-message` sends a
builder's attachments the same way `the build result of` does. Media galleries and file
displays (components v2) take file uploads too, the same way.

syntax: messageaction#attachments compact

## Reading attachments

[`discord attachments of`](syntax:message#discord-attachments) a sent message returns its
files as `attachment`, a read-only type with its own properties and conditions.

| Property | Returns |
| --- | --- |
| [attachment url](syntax:attachment#attachment-url) | the CDN url of the file |
| [file name](syntax:attachment#file-name) | the file's name, spoiler prefix included |
| [file extension](syntax:attachment#file-extension) | the extension, or nothing if it has none |
| [attachment duration](syntax:attachment#attachment-duration) | the length of an audio (voice message) attachment, or nothing otherwise |

Four conditions describe what kind of file it is:

| Condition | True when |
| --- | --- |
| [is an image attachment](syntax:attachment#an-image-attachment) | the file is an image |
| [is a video attachment](syntax:attachment#a-video-attachment) | the file is a video |
| [is an audio attachment](syntax:attachment#an-audio-attachment) | the file is a voice message; `attachment duration` works on it |
| [is a spoiler attachment](syntax:attachment#a-spoiler-attachment) | the file name carries the `SPOILER_` prefix |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-echo":
        set {_att} to first element of discord attachments of event-message
        if {_att} is set:
            set {_f} to a new file upload from attachment {_att} named "echo-%file name of {_att}%"
            set {_m} to a new message with content "re-uploaded" in event-channel
            add {_f} to attachments of {_m}
            await set {_sent} to the build result of {_m}
```

### Downloading an attachment

[`download`](syntax:attachment#download) saves an attachment to a file on the server. The line
waits until the file is written, so the next line can already read or re-upload it.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!save":
        loop discord attachments of event-message:
            download loop-value to folder "plugins/MyScript/uploads/"
        reply with "saved %size of discord attachments of event-message% file(s)"
```

The path decides where the file goes:

| Path | Saved as |
| --- | --- |
| ends with `/` or `\`, or names an existing folder | that folder, under the attachment's `file name` |
| anything else | exactly that file (`to file "plugins/MyScript/last.png"`) |

Missing folders are created, and a file already at that path is overwritten. A relative path
starts from the server's root folder (where the server jar is), so `plugins/MyScript/` lands
next to the other plugin folders. The words `folder`, `file` and `path` are only there for
reading: `download {_att} to "plugins/MyScript/uploads/"` does the same as the example above.

syntax: attachment#download compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *IllegalArgumentException: the file '\<path>' does not exist* | `a new file upload from file` was given a path with nothing there | Check the path is relative to the server's working directory, and that the file is present |
| *UncheckedIOException: could not download '\<url>'* | The url given to `from url` failed to download when the message was sent | Check the url is reachable, or wrap the send in `try` and read the [error](doc:concepts/errors) |
| A *Discord error* block naming the file too large | The file exceeds Discord's per-upload limit for the guild (usually 10 MB, more with server boosts) | DiSky does not check the size itself; shrink or compress the file before uploading it |

entity: fileupload
