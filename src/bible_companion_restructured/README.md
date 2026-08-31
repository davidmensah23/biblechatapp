# Bible Companion --- Restructured Prompt Architecture

## What changed

The original master prompt mixed application behavior, character
behavior, safety, counseling, routing, and user-profile rules into one
document.

This version separates those responsibilities.

### Runtime order

``` text
USER MESSAGE
    ↓
01 Core Companion
    ↓
02 Relevant Memory / Open Threads
    ↓
03 Conversation Mode
    ↓
04 Router
    ↓
05 Biblical Grounding
    ↓
Character file
    ↓
07 Safety check
    ↓
Response
    ↓
Memory extraction + relationship update
```

## Files

-   `01_CORE_COMPANION.md` --- companion behavior.
-   `02_MEMORY_AND_RELATIONSHIP.md` --- persistent continuity.
-   `03_CONVERSATION_MODES.md` --- interaction types.
-   `04_ROUTER.md` --- character/mode routing.
-   `05_BIBLICAL_GROUNDING.md` --- Scripture vs inference vs tradition
    vs unknown.
-   `06_CHARACTER_SOCIAL_GRAPH.md` --- relationships among characters.
-   `07_SAFETY.md` --- safety and boundaries.
-   `08_ENGAGEMENT.md` --- healthy retention.
-   `09_CHARACTER_SCHEMA.md` --- character data model.
-   `10_SOURCE_MIGRATION_NOTES.md` --- what was preserved and what was
    newly designed.
-   `characters/` --- migrated character cards from the supplied source.

## Recommended implementation

Do not send every file as one giant prompt on every request.

Instead: 1. Keep the core rules as system/developer instructions. 2.
Retrieve only relevant memory. 3. Retrieve the selected character card.
4. Retrieve the relevant mode instructions. 5. Retrieve Bible-grounding
instructions when the question requires factual/scriptural depth. 6.
Apply safety independently. 7. Run a memory-extraction step after the
conversation.

## Product principle

The character is the **voice**.

The companion system is the **relationship**.

The Bible is the **foundation**.

The application is the **experience**.

## Security principle

Do not attempt to solve prompt injection, crisis handling, age/location
verification, or length enforcement with the character prompt alone.

The prompt supplies behavior. The application supplies **authority,
state, verification, validation, and escalation**.

-   `13_RED_TEAM_AND_EVALUATION.md` --- structured red-team methodology,
    scenarios, severity, and release gates.

## New baseline

The architecture now treats red teaming as a continuous product process,
not a one-time prompt review. Confirmed failures become regression
tests.
