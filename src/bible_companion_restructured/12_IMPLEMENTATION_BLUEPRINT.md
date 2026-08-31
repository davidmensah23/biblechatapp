# Bible Companion --- Implementation Blueprint

This document turns the prompt architecture into application
responsibilities.

## Trusted application state

The server/database should own:

``` text
user_id
verified_or_declared_age_state
current_location_state
active_character_id
conversation_mode
council_members
memory_records
open_threads
safety_state
crisis_resource_version
```

The user message cannot directly modify these values.

## Suggested services

### 1. Input Safety Service

Screens/classifies incoming messages for high-risk content and abuse.

### 2. Intent + Injection Service

Determines: - conversation intent; - possible prompt injection; -
character request; - mode request.

### 3. Memory Service

Retrieves relevant memory and validates memory updates.

### 4. Character Service

Loads the selected character card and its approved relationships.

### 5. Bible Retrieval/Grounding Service

Provides relevant biblical material and its certainty classification.

### 6. Council Orchestrator

Controls multi-character turn order and context.

### 7. Generation Service

Generates the response using only the context authorized for that turn.

### 8. Output Validator

Checks: - safety; - character integrity; - length; -
protected-information leakage; - unsupported claims; - crisis hand-off.

### 9. Crisis Resource Service

Returns current, verified, location-appropriate resources.

## State machine

``` text
NORMAL
  ↓
CONCERN
  ↓
HIGH_RISK
  ↓
CRISIS_RESPONSE
  ↓
SAFE_RETURN / CONTINUE_WITH_CAUTION
```

Safety state should be controlled by application logic, not by the
character.

## Character state machine

``` text
CHARACTER_A
   ↓ user requests switch
SWITCH_REQUEST
   ↓ application/router approves
CHARACTER_B
```

Never:

``` text
user text
   ↓
directly mutate active_character_id
```

## Council

Use an orchestrator rather than asking a single unconstrained generation
call to simulate all members.

Recommended sequence:

``` text
user question
  ↓
select council
  ↓
prepare shared context
  ↓
turn 1
  ↓
turn 2
  ↓
turn 3
  ↓
orchestrator synthesis / stop
```

Limit turns and characters to keep the experience coherent and
affordable.

## Length enforcement

Use both: 1. generation guidance; 2. post-generation validation.

If the response exceeds the mode's target: - shorten through a
controlled rewrite; - or regenerate with stricter constraints.

Do not rely on prompt wording alone.

## Monitoring

Track anonymized/appropriate operational metrics such as: - safety
classifier disagreements; - output validation failures; - character
drift reports; - excessive-length rate; - prompt-injection attempts; -
crisis hand-off rate; - false-positive safety rate.

Use these to improve prompts and models without storing unnecessary user
content.
