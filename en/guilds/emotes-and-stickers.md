---
title: Emotes and stickers
icon: smile-plus
description: Create custom emotes and stickers in a guild, restrict an emote to some roles, and delete them.
tags: [guild, emote, sticker, builder]
syntaxes:
  - emotebuilder#new-emote-builder
  - emotebuilder#allowed-roles
  - stickerbuilder#new-sticker-builder
  - stickerbuilder#sticker-tags
order: 3
---

This page covers creating the custom emotes and stickers of a guild from an image, then deleting
them. You're assumed to have a bot named `"my-bot"` logged in, to know how
[builders](doc:concepts/builders) work, and to give the bot the permissions listed at the end of
the page.

## Creating an emote

[`a new emote builder named %string% with image %string/fileupload% in %guild%`](syntax:emotebuilder#new-emote-builder)
prepares an emote; [`the build result of`](syntax:emotebuilder#result) it creates the emote on
Discord and returns it, so it requires `await`. The image is an `https://` URL, a path on the
Minecraft server, or a [file upload](syntax:core/expressions#expression-new-file-upload).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-emote":
        set {_b} to a new emote builder named "party_blob" with image "https://example.com/blob.png" in event-guild
        await set {_emote} to the built emote from {_b}
        reply with "Created %{_emote}%, use it as :%name of {_emote}%:"
```

Nothing is downloaded until the `await` line runs: DiSky then reads the image, checks it and sends
it. What comes back is a regular `emote`, so [emote image url](syntax:emote#emote-image-url),
`name` and `destroy` work on it. Unlike most builders, an emote builder reads back:
`name of {_b}` gives the name it will be created with.

| Rule | Value |
| --- | --- |
| Name | 2 to 32 characters, letters, digits and underscores only |
| Image | PNG, JPEG, GIF or WEBP, 256 KB at most; a GIF makes an animated emote |
| Slots | 50 static and 50 animated emotes, more with boosts (up to 250 each) |

syntax: emotebuilder#new-emote-builder compact
syntax: emotebuilder#result compact

## Restricting an emote to roles

By default everyone in the guild can use a new emote.
[allowed roles](syntax:emotebuilder#allowed-roles) limits it to members holding one of the listed
roles; the roles must belong to the same guild. It accepts `set`, `add`, `remove` and `delete`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vip-emote":
        set {_b} to a new emote builder named "vip_star" with image "plugins/DiSky/star.png" in event-guild
        add role with id "123456789012345678" to allowed roles of {_b}
        await set {_emote} to the built emote from {_b}
        reply with "%{_emote}% is reserved to %size of allowed roles of {_emote}% role(s)"
```

`allowed roles of` an existing emote reads the same list; it is empty when everyone can use it.

syntax: emotebuilder#allowed-roles compact

## Creating a sticker

A sticker works the same way, with two extra fields Discord requires or shows: a description and
tags. [`a new sticker builder named %string% with image %string/fileupload% in %guild%`](syntax:stickerbuilder#new-sticker-builder)
(`with file` works too) prepares it, and the build creates it. A sticker needs **at least one tag**:
the words or emojis Discord suggests the sticker for when a member types them.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-sticker":
        set {_b} to a new sticker builder named "Party Blob" with image "https://example.com/blob-320.png" in event-guild
        set description of {_b} to "A blob that parties"
        add "tada" and "party" to sticker tags of {_b}
        await set {_sticker} to the built guildsticker from {_b}
        reply with "Created the sticker %name of {_sticker}%"
```

| Property | Default | Accepted values |
| --- | --- | --- |
| [description](syntax:stickerbuilder#description) | empty | empty, or 2 to 100 characters |
| [sticker tags](syntax:stickerbuilder#sticker-tags) | none | at least one; no comma inside a tag; 200 characters at most once joined |

The name is 2 to 30 characters. The file is a PNG, an APNG, a GIF or a Lottie JSON animation of
512 KB at most; Discord displays stickers at 320x320 pixels, so a square image of that size looks
best. Lottie stickers are reserved to verified and partnered guilds. DiSky recognises the format
from the file's content, so a URL without an extension works. A guild has 5 sticker slots, more
with boosts (up to 60).

`description of` and `sticker tags of` also read an existing guild sticker.

syntax: stickerbuilder#new-sticker-builder compact
syntax: stickerbuilder#sticker-tags compact

## Deleting emotes and stickers

[`destroy`](syntax:core/effects#destroy) deletes an emote or a guild sticker, like any other entity.
To find one, read [emojis of the guild](syntax:guild#emojis) or
[stickers](syntax:guild#stickers) from the cache, or `await` [emotes](syntax:guild#emotes) to ask
Discord directly.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-emotes":
        loop emojis of event-guild:
            if name of loop-value starts with "temp_":
                destroy loop-value
```

!!! danger "Deletion is final"
    A destroyed emote or sticker cannot be restored. Build it again from its image if you need it
    back; it gets a new id.

## Permissions

The bot needs **Create Expressions** to create emotes and stickers; it can then edit and delete
the ones it created. Deleting emotes or stickers created by someone else needs
**Manage Expressions**. Both are granted through a role, in the guild's settings.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *the emote name '...' is invalid: it must be 2 to 32 characters long and only contain letters, digits and underscores* | A space, a dash or an accent in the name | Use letters, digits and underscores |
| *the emote image read from '...' is larger than 256 KB, the maximum Discord accepts* (*512 KB* for a sticker file) | The image is too heavy | Compress or resize the image |
| *the emote image is not a PNG, JPEG, GIF or WEBP image* / *a sticker must be a PNG, APNG, GIF or Lottie JSON file* | The source is not an image, or a JPEG was given for a sticker | Convert the file |
| *could not read the emote image from '...': not found* | The URL answers 404, or the path is wrong | Check the URL or the path |
| *a sticker needs at least one tag (a word or an emoji Discord suggests it for)* | `sticker tags` is empty | Add at least one tag |
| *[30008] Maximum number of emojis reached* / *[30039] Maximum number of stickers reached* | The guild has no free slot left | Delete one, or boost the guild |
| *Cannot perform action due to a lack of Permission. Missing permission: CREATE_GUILD_EXPRESSIONS* | The bot lacks **Create Expressions** | Grant it |
| *[50035] Invalid Form Body* naming `image` or `file` | Discord could not decode the file | Use a valid image of the right format |

entity: emotebuilder
