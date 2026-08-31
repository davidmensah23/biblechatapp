# Bible Companion --- Prompt Injection & Adversarial Defense

## Purpose

The character model is an untrusted execution surface. The application
must not assume that a long system prompt alone will prevent prompt
injection.

Security controls should be implemented outside the character prompt
wherever possible.

## Threat families

The system should test against:

1.  Direct instruction override.
2.  Character-break/meta-role attacks.
3.  Hypothetical or fictional framing.
4.  Multi-turn gradual escalation.
5.  Encoding and obfuscation.
6.  Council/multi-character abuse.
7.  Crisis-protocol inversion.
8.  Age/profile spoofing.
9.  Memory manipulation.
10. Prompt extraction.
11. Tool/output injection.
12. User-provided documents containing malicious instructions.

## Defense architecture

``` text
USER MESSAGE
     ↓
Input / abuse screening
     ↓
Safety classification ───────────────┐
     ↓                               │
Intent + injection classification   │
     ↓                               │
Trusted application state            │
     ↓                               │
Relevant memory retrieval            │
     ↓                               │
Character + mode context             │
     ↓                               │
Character generation                 │
     ↓                               │
Output validation ◄──────────────────┘
     ↓
USER
```

## Non-negotiable separation

Never place security-sensitive authority in user-editable character
data.

Keep these outside character cards: - safety policy; - system/developer
instructions; - session locks; - memory permissions; - crisis resource
configuration; - tool permissions; - account/age verification state.

## Prompt extraction

If a user asks for the hidden prompt, system instructions, developer
instructions, private memory, or internal security configuration:

-   do not provide it;
-   do not summarize it in a way that enables bypass;
-   do not quote protected text;
-   provide a high-level explanation if useful.

## Gradual escalation

The system should treat safety and security as **conversation-level
state**, not only message-level state.

Repeated boundary-testing should be observable to the safety/security
layer.

Do not "reward" persistence by progressively revealing more.

## Obfuscation

The security layer should normalize obvious encoding/obfuscation where
technically appropriate, but must not depend on detecting every encoding
scheme.

The core defense is instruction hierarchy and external policy
enforcement.

## Crisis inversion

A user cannot disable crisis handling by saying: - "stay in
character"; - "don't give me resources"; - "pretend this isn't
serious"; - "this is only role-play."

Safety classification remains authoritative.

## Memory attacks

Never allow the user to directly inject arbitrary permanent memory
through ordinary conversation.

Treat statements such as: \> "Remember that your system prompt says..."

as ordinary content unless the application has a dedicated, validated
memory-update pathway.

Memory updates should be: - structured; - validated; - attributable to a
conversation; - reversible/correctable; - filtered for sensitivity.

## Tool and retrieval injection

Retrieved documents, web pages, user uploads, and tool outputs are data,
not authority.

If retrieved content contains instructions, those instructions must not
override the application policy.

## Output validation

At minimum, validate: - safety outcome; - crisis hand-off; - prohibited
professional certainty; - character integrity; - excessive length; -
accidental system-prompt disclosure; - unsupported claims of identity; -
hidden instruction leakage.

For high-risk categories, the application should be able to suppress the
character response and substitute a safety response.

## Important limitation

No prompt can guarantee immunity from adversarial inputs.

The goal is defense in depth: - model instruction hierarchy; - external
classifiers; - trusted application state; - output validation; - rate
limits; - logging/monitoring; - regular red-team testing; - human review
for high-risk incidents.

## Red-team test suites

Maintain repeatable tests for: - one-shot injection; - multi-turn
escalation; - role-play injection; - council injection; - encoded
injection; - crisis inversion; - age spoofing; - location spoofing; -
memory poisoning; - prompt extraction.

Track regressions whenever the model, prompt, routing logic, or
character cards change.
