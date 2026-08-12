# Data provenance and licences

Where each data file came from, what licence it carries, and how to regenerate
it. Fetched 2026-08-10.

Learning orders are transcribed from primary sources only. A wrong order is
invisible in use and teaches the wrong thing for weeks, so a secondary account
of an ordering is not sufficient: not documentation, not a forum post, not
memory.

---

## `orders.json`

Three learning orders. Each entry has a display `name` and a `sequence` of
characters in the order they are introduced.

### `koch`: classic Koch / SuperMorse

40 characters: the 26 letters, the 10 digits, and `. , ? /`.

```
K M R S U A P T L O W I . N J E F 0 Y , V G 5 / Q 9 Z H 3 8 B ? 4 2 7 C 1 D 6 X
```

This is the ordering used by the SuperMorse program, long the most widely cited
Koch-method sequence.

### `lcwo`: Learn CW Online

41 characters over LCWO's 40 lessons: lesson 1 introduces **K and M together**,
and each of lessons 2–40 adds a single character. That arithmetic is the check
that the sequence is complete and correctly ordered.

```
K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X
```

Transcribed from LCWO's own source code, the `$kochchar` array in
`inc/functions.php` of <https://git.fkurz.net/dj1yfk/lcwo> (GitHub mirror:
`dj1yfk/lcwo`). LCWO is by Fabian Kurz, DJ5CW (ex DJ1YFK); its code is AGPL-3.
Only the factual ordering was taken, not code.

The lesson pages themselves require an account and the site's FAQ does not
publish the ordering, which is why the source code is the reference here. Per a
2011 note by LCWO's author, the ordering derives from one published by DF2OK;
that page (`df2ok.privat.t-online.de/afu01a.htm`) is long dead and was not
reachable, so LCWO's source is treated as the primary source.

### `cwops`: CW Academy

44 characters: the 26 letters, the 10 digits, `? , / .`, and the prosigns
`<AR> <BT> <BK> <SK>`.

Transcribed from the CW Academy Beginner curriculum, sessions 1–10:
<https://cwops.org/wp-content/uploads/2025/02/Beginner-curriculum.htm>
(2025-02 revision, published by CWops). Sessions 11–13 are QSO practice and
14–16 are on-air preparation; neither introduces new characters.

**This curriculum introduces a set of characters per session, not one at a time.**
Both forms are kept in the file: `sessions` holds the ten printed groups, and
`sequence` is those groups flattened, preserving the within-session order.

| Session | Characters |
|---|---|
| 1 | A E N T |
| 2 | S I O 1 4 |
| 3 | D H L R 2 5 |
| 4 | C U |
| 5 | M W 3 6 ? |
| 6 | F Y , |
| 7 | G P Q 7 9 / |
| 8 | B V `<AR>` |
| 9 | J K 0 8 `<BT>` |
| 10 | X Z . `<BK>` `<SK>` |

Flattened, the session boundaries fall at cumulative indices 4, 9, 15, 17, 22,
25, 31, 34, 39, 44.

---

## `words-common.json`

1000 words, frequency-ordered, lowercase, matching `[a-z]{2,8}`.

- **Source:** `content/2018/en/en_50k.txt` from
  <https://github.com/hermitdave/FrequencyWords>, word frequencies over the
  OpenSubtitles 2018 corpus, via OPUS.
- **Licence:** that repository states *MIT for code, CC BY-SA 4.0 for content*.
  A word list is content, so this file is **CC BY-SA 4.0**: attribution as above,
  and a modified list must be redistributed under the same licence.
- **Regenerate with:** `sh tools/build-words.sh`

### Filtering, and why it is needed

The corpus is raw film and television subtitle text. Two artefacts survive naive
filtering:

1. **Contraction fragments rank high.** The corpus tokeniser split contractions
   before publication, leaving real-looking non-words in the top ranks: `don`
   (rank 26), `didn` (96), `doesn` (176), `isn` (186), and likewise `wasn`,
   `wouldn`, `couldn`, `aren`, `shouldn`, `weren`, `hasn`, `em`. Filtering on
   "contains no apostrophe" does not remove any of them. Note that `can` and
   `won` are kept deliberately, because those are real words.
2. **Non-words and markup leak through:** filler noises (`uh`, `um`, `hmm`,
   `ooh`) and HTML entity remnants such as `lt`, from `&lt;`.

Profanity also appears within the top 1000 and is filtered out. That choice is a
judgement call rather than a fact about the data, and it is one editable line in
`tools/build-words.sh`.

Known remaining quirks, left in deliberately: informal spoken forms (`gonna`,
`wanna`, `gotta`), a handful of given names (`sam`, `joe`, `tom`, `ben`) that a
film corpus inflates, and the mild British `bloody`.

### Alternatives considered

- **Leipzig Corpora Collection**: CC BY 4.0, attribution only, which would be
  the more permissive licence. Its download host was behind anti-scraping
  protection and could not be fetched.
- **Norvig's `count_1w.txt`**: rejected on licensing. The underlying Google Web
  Trillion Word Corpus is distributed by the Linguistic Data Consortium, and
  non-educational use without an LDC licence is discouraged by its publisher.

### How many words a given charset yields

Word drilling only works once enough characters are unlocked to make a
non-memorisable pool. Against this list, using the `koch` order:

| Active characters | Available words |
|---|---|
| 8 | 24 |
| 9 | 31 |
| 10 | 55 |
| 12 | 82 |
| 14 | 118 |
| 16 | 257 |
| 20 | 348 |

Unlocking a punctuation mark adds nothing, since no word in the list contains
one. Hence the flat steps (12 to 13 stays at 82).

---

## `phrases-cw.json`

On-air vocabulary in four groups, so subsets can be selected: `abbreviations`,
`qcodes`, `prosigns`, `fragments`. Prosigns are keyed by their bracketed token
(`<AR>`, `<SK>`, `<BT>`, `<KN>`) and sound as a single character with no gap
inside.

---

## Validation

`tests/data.test.js` asserts all of the following, so a bad edit fails loudly
rather than silently teaching the wrong thing:

- no duplicate entries within an order;
- exactly 26 letters and 10 digits in every order;
- every character present in the Morse table, so nothing is unsendable;
- `cwops.sessions` flattens exactly to `cwops.sequence`;
- the word list is 1000 unique `[a-z]{2,8}` entries with no contraction
  fragments;
- every phrase token is sendable, and every prosign is a table key.

### Characters that share a code

Three pairs of tokens are audibly identical:

| Code | Tokens |
|---|---|
| `-...-` | `=` and `<BT>` |
| `.-.-.` | `+` and `<AR>` |
| `-.--.` | `(` and `<KN>` |

This is not hypothetical: the `lcwo` order teaches `=` where `cwops` teaches
`<BT>`, and they are the same sound. Answers are therefore compared with each
pair folded to one canonical token, so writing down what was actually heard is
never scored as an error. A test asserts that every code collision in the table
is covered by that folding, so adding a colliding character later fails loudly.
