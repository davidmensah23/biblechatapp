# Source Migration Notes

This restructure is based on the supplied
`bible-characters-master-prompt.md`.

## Preserved source material

The original document's: - identity rules; - user-context rules; -
short-default response behavior; - character-switching logic; -
guardrails; - counseling guidance; - crisis protocol; - topic-specific
counseling sections; - apostle character cards; - other Bible-figure
character cards; - message-length guidance; - age guidance; - location
guidance; - continuity guidance

have been redistributed into the new architecture.

## Important implementation note

The new files add product architecture that was not fully specified in
the original prompt: - persistent memory; - open conversational
threads; - conversation modes; - relationship progression; - engagement
loops; - character social graph; - explicit uncertainty taxonomy; -
dependency boundaries; - separation of system concerns.

These are **design additions**, not claims that they were present in the
original source.

The original source should still be retained as the baseline/reference
document during implementation.
