# Setting up the background music

Twelve tracks, three per occasion, all from Pixabay Music (free for
commercial use, no attribution required). This is a manual step, and
here's why: Unsplash lets anyone download a photo with one link, but
Pixabay gates its music downloads behind a free account — there is no
script that can do this part for you, the way `fetch-demo-photos.mjs`
does for the photographs. It's twelve clicks, about five minutes.

## 1. Get a free Pixabay account

If you don't have one already: pixabay.com → sign up (free). Downloading
music requires being logged in; downloading images doesn't, which is why
the photos had a script and this doesn't.

## 2. Download each track

Open each link below, click **Free Download**, and save it with the
**exact filename** shown — the app looks for these names specifically.

| Save as | Track | Page |
|---|---|---|
| `wedding-01.mp3` | Wedding Piano — PaulYudin | https://pixabay.com/music/wedding-wedding-piano-162472/ |
| `wedding-02.mp3` | Wedding Romantic Love Music — andriig | https://pixabay.com/music/wedding-wedding-romantic-love-music-471301/ |
| `wedding-03.mp3` | Wedding Garden Ceremony Glow — alex-morgan | https://pixabay.com/music/wedding-wedding-garden-ceremony-glow-578500/ |
| `birthday-01.mp3` | Birthday Celebration Tune — alex-morgan | https://pixabay.com/music/introoutro-birthday-celebration-tune-579468/ |
| `birthday-02.mp3` | Birthday (Instrumental) | https://pixabay.com/music/instrumental-birthday-584568/ |
| `birthday-03.mp3` | Birthday — The_Mountain | https://pixabay.com/music/happy-childrens-tunes-birthday-490600/ |
| `naming-01.mp3` | Lullaby Music | https://pixabay.com/music/lullabies-lullaby-lullaby-music-576578/ |
| `naming-02.mp3` | Gentle Baby Sleep Lullaby Dream — alex-morgan | https://pixabay.com/music/lullabies-gentle-baby-sleep-lullaby-dream-530944/ |
| `naming-03.mp3` | Lullaby Music — MarloweMusic | https://pixabay.com/music/modern-classical-lullaby-music-581507/ |
| `housewarming-01.mp3` | Warm Acoustic Music — andriig | https://pixabay.com/music/folk-warm-warm-acoustic-music-573245/ |
| `housewarming-02.mp3` | Warm Acoustic Guitar — Universfield | https://pixabay.com/music/acoustic-group-warm-acoustic-guitar-232912/ |
| `housewarming-03.mp3` | Acoustic Folk — JonasBlakewood | https://pixabay.com/music/folk-acoustic-folk-580577/ |

Put all twelve in `public/music/`.

## 3. Check you got them all

```
node scripts/check-music.mjs
```

This doesn't download anything — it looks at what's already in
`public/music/`, confirms each file is a real, playable MP3 (not an
empty file or an HTML login page saved by mistake, which is the most
common way this goes wrong), and tells you exactly what's still missing
and its download link.

## 4. Add to `.gitignore`, same as the photos

```
public/music/
```

Twelve music files don't belong in git either.

## If a track ever gets taken down

Pixabay creators do occasionally remove tracks. If a link 404s, search
pixabay.com/music for something in the same mood (the categories used
were: Wedding, Birthday / Happy Children's Tunes, Lullabies, Folk /
Acoustic) and swap the entry in `lib/music/tracks.js` — keep the same
`file` name so nothing else has to change.

## What happens if you skip this

Nothing breaks. An invitation whose track hasn't been downloaded yet
opens exactly the same way, just without music — `useCinemaMusic` treats
a missing file as "no track" rather than an error. Guests never see a
broken player; they just don't hear anything.
