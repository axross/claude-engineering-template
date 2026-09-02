# Waiting and Dormancy

Apply this reference whenever the run is about to stop and wait — for a human answer, a delegated worker, or a machine event — and needs to decide what stopping should look like and how long to leave before checking again. [independent-review.md](./independent-review.md) owns the CI-and-independent-review tail's own mechanics — event delivery, the flip conditions, addressing findings; [pre-flight-review.md](./pre-flight-review.md) owns its two human parks; [writer-ownership-and-recovery.md](./writer-ownership-and-recovery.md) owns what may and may not happen while a worker holds the writer lease. None of those states the cost model behind the choice, or classifies where else it recurs. This reference states that shared model once; the places above route to it rather than restating it.

## The Three-Tier Cost Model

Every session carries a warm context — instructions, repository state, everything read so far — held ready so the next turn does not reconstruct it from scratch. A harness typically prices that warm state as a cache with a lifetime: a prompt-cache TTL, ticking from the last turn that touched the session. Interruption is not a flat cost against that lifetime; it is a step function with three tiers, and what sets the steps is exactly that TTL:

- **A gap that ends inside the TTL** resumes off a cache still warm. The resuming turn re-reads what it needs from that warm state — a cache _read_, cheap and roughly constant regardless of how long the gap ran, as long as it stayed under the limit.
- **A gap that ends past the TTL** resumes off a cache that has already expired. The underlying state has to be reconstructed before the resuming turn's own work can start — a cache _rebuild_, costing meaningfully more than a read and scaling with how much context there was to rebuild.
- **Several gaps in one wait, each ending past the TTL,** each independently pay that rebuild. A run that checks in five times over a long wait, with more than the TTL elapsing between each check, does not pay one rebuild for the whole wait — it pays the rebuild five times, once per gap that crossed the line.

The tiers key on the _gap since the last turn_, not the wait's total duration. A wait running for hours can cost only reads throughout, provided every successive check lands inside the TTL of the one before it; a wait running for minutes can still cost a full rebuild, if its one check lands just past the line. State the model as structure — a step function keyed to a boundary — rather than as a number: the boundary is a property of the platform running the session, and it moves out from under any interval a project fixes in advance.

**Measuring your own tiers.** A project does not have to guess where its own boundary sits; the platform's own request accounting exposes it. Every request a session makes reports how much it spent building cache versus how much it read from cache already warm — a request dominated by cache-creation cost is a rebuild, one dominated by cache-read cost is a read.

1. Pull the request-level record for a stretch of a project's own runs, long enough to have crossed gaps of several different lengths.
2. For each request, compute the gap since the previous request in the same session or context, and tag it read or rebuild by which cost dominates.
3. Bucket the gaps by length and read where the rebuild-tagged requests start clustering — the boundary is wherever that cluster begins.

Run this per actor rather than once for the whole project — a top-level session and a spawned subagent commonly observe different boundaries, so a gap that reads warm for one can already be a rebuild for the other, and one reported figure would silently average the two into a number that fits neither.

**Guidelines:**

- MUST treat interruption cost as the three-tier step function above — a read inside the boundary, a rebuild past it, a rebuild paid once per gap that crosses it — rather than as a flat or linear cost.
- MUST measure a project's own boundary by bucketing request-level cache-creation signal by gap length and reading where the rebuild-dominated requests cluster, run separately for each kind of actor that waits, rather than reusing a figure carried over from elsewhere.
- SHOULD re-run that measurement when the platform, the model, or the harness changes, since the boundary is a property of what is running the session rather than of the project.

## Choosing the Mechanism

The cost model above decides the mechanism, not the other way round. A wait has an expected shape — how long until the awaited thing is likely to resolve — and the shape decides whether to keep checking or to stop checking until the end.

**A wait expected to end inside the boundary is polled inside it.** Schedule the next check at an interval short enough that the gap since the last turn never crosses the boundary, so every resume after the first is a read. This is the ordinary case for a short, well-understood completion profile: each wake finds the cache still warm, however many times it repeats, because no individual gap crosses the line.

**A wait expected to run past the boundary is collapsed into a single dormancy.** Do not keep polling at a cadence the boundary will outlast — a check scheduled further out than the boundary is, by construction, a rebuild the moment it fires, whatever cadence produced it. Once the expected wait exceeds the boundary, stop scheduling intermediate checks and schedule exactly one wake, timed to when the awaited thing is actually expected to be ready, or to the outer cap that governs the wait, whichever comes first. That single wake pays one rebuild instead of several, exactly once no matter how long the underlying wait runs.

**Several middling gaps are never manufactured.** A cadence chosen for some other reason — a round number, a habit carried over from a different check — can happen to space each successive wake further apart than the boundary. Every such wake then pays the rebuild the first one already paid, for no benefit over a single wake at the end: the intermediate checks do not make the answer arrive sooner, only multiply how many times the run pays to find out it is not there yet.

**The break-even as a derivation.** The question is not "how long will this wait run," but "does the cadence this wait would naturally use ever step past the boundary." State it as a derivation rather than an interval, so it travels to a project whose boundary or check profile differs from any other's:

- Let the wake cadence be whatever the pending work's own completion profile already derives — the interval that places checks sensibly against how the awaited thing actually tends to resolve (see the independent-review reference for that derivation in the CI-and-review case; the same logic applies to any other machine wait).
- If every step in that cadence lands inside the boundary, it runs as derived — the boundary changes nothing, because no step crosses the line.
- If any step would land past the boundary, replace every step from that point on with a single dormancy: one wake, timed at the outer bound of the wait rather than at the cadence's own next step.

Run this against two quantities a project measures for itself — its own boundary, from the procedure above, and its own check-completion profile, from its own recent runs — never against a number carried over from another project or platform version. As of this writing, two commonly observed boundaries are roughly an hour for a top-level agent session and roughly five minutes for a spawned subagent; treat these as currently-observed platform behavior worth re-checking against the measurement above, not as constants to build a schedule on, since a platform can change how long it keeps a session's cache warm without announcing it.

**The pending-checks rule stays; the boundary is an added constraint, not a replacement.** Deriving a wake from the pending checks' own completion profiles — placing the first wake just past where the fastest check should already have decided, then stepping across the slower ones — is still how the cadence is built. The boundary is a further test that cadence has to pass: one that already stays inside it needs nothing further, and one that would step past it keeps its placement but collapses the offending steps into the single dormancy above.

**Guidelines:**

- MUST poll inside the boundary for a wait expected to resolve inside it, scheduling each successive check so the gap since the previous turn stays under the measured boundary.
- MUST collapse a wait expected to run past the boundary into a single dormancy — one wake, timed at the wait's expected resolution or its outer cap — rather than continuing to poll at a cadence the boundary will outlast.
- MUST NOT schedule a cadence whose steps individually cross the boundary; where the pending-checks derivation would produce such a step, replace it and every step after it with the single dormancy above rather than paying the rebuild once per step.
- MUST derive the wake cadence itself from the pending checks' own completion profiles first, and apply the boundary as an additional constraint on that cadence rather than as a substitute derivation.
- MUST treat any prompt-cache boundary named in this reference as a currently-observed value to re-measure against a project's own actors, never as a fixed constant a schedule may be built on directly.

## The Ten Places, Classified

Every point where this loop stops and waits falls into one of two families, and the family — not the topic, not which document describes the place — decides the shared invariant. **Human waits** share exactly one invariant: a self-wake is never scheduled to check whether a human has answered, since manufacturing one would only produce the several-middling-gaps failure already forbidden above, for a channel — a human's own attention — that no schedule can make arrive any sooner. What a human wait does _instead_ is not one answer. A gate the human reads at their own pace, and a comment arriving after work has already been handed back once, end the turn: the human returns on their own schedule, with nothing scheduled to check for it. A decision with options is instead put to the human inline, through the harness's question tool, and answered in the same turn — ending the turn only where the session exposes no such tool at all. The question tool is exactly a mechanism to reach a human: this loop's default for a decision with options, not a fallback reached once every other channel has failed. **Machine waits** take the mechanism choice above, decided against each wait's own expected shape.

| Waiting place                                                                                          | Family  | Mechanism                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------- |
| A gate where a human must review and approve before work continues                                     | Human   | End the turn                                                                 |
| A decision that changes scope, requirements, or an approved artifact, put to the human                 | Human   | Asked inline through the question tool; ends the turn only where none exists |
| A comment or reply from a human after work has already been handed back once                           | Human   | End the turn                                                                 |
| A confirmation the run needs before dismissing a review finding at a severity it may not resolve alone | Human   | Asked inline through the question tool; ends the turn only where none exists |
| A question about whether to keep spending further rounds on a loop that has not converged              | Human   | Asked inline through the question tool; ends the turn only where none exists |
| A delegated worker holding the only writer lease while it edits                                        | Machine | Poll inside the boundary, or one dormancy                                    |
| A read-only review worker judging a diff before the authoritative review runs                          | Machine | Poll inside the boundary, or one dormancy                                    |
| A verification command — format, lint, type-check, test, build                                         | Machine | Poll inside the boundary, or one dormancy                                    |
| The authoritative review-and-CI tail after work is handed off for judgment                             | Machine | Poll inside the boundary, or one dormancy                                    |
| A loop that has stopped converging with no further round available                                     | Human   | End the turn                                                                 |

The last row is not a third family, and it is not a dormancy either, whatever the loose phrase "dormancy on non-convergence" might suggest. It is what the document governing it already says: once a loop has spent its own round cap without converging, the run records what still fails and ends the turn, waiting for the human to decide what happens next. Nothing is scheduled to wake it again on its own — which is exactly why it cannot be a dormancy under the model above. A dormancy is, by construction, the single wake a _machine_ wait collapses into once its own expected resolution is going to outlast the boundary; a stop that schedules no wake at all is not that.

Genuine dormancy already has its home in the table, in the four machine rows, and needs no row of its own beside the one non-convergence occupies. Each of those rows is bounded by an outer cap — a declared timeout where the awaited work states one, a fallback ceiling where it does not — on top of the prompt-cache boundary the mechanism choice already keys on. A wait whose expected resolution is going to outlast that outer cap does not keep polling until the cap fires: it collapses into the single dormancy the mechanism choice above already describes, timed at the cap itself once no earlier expected-resolution time is left to time it against instead. That is what "or one dormancy" already names — a machine wait that outlives the outer cap governing it — and it never stops being a machine wait the way non-convergence stops being one at all.

**Do not collapse this table into one procedure.** The human/machine split is why the poll-or-dormancy mechanism applies to the four machine rows and not the other six human ones — and, inside the human rows, why three end the turn while three are asked inline instead. Averaging any of these — polling a human on a machine's cadence, ending the turn on every human wait the way the gates do, or reaching for a dormancy on a human wait the way a machine wait's outer cap does — gets the cost wrong every time.

**Guidelines:**

- MUST treat "no self-wake is scheduled to check for a human's answer" as the invariant every human wait in the table shares, and MUST NOT assert or imply that no mechanism exists to reach a human — the question tool reaches one inline, and is this loop's default for a decision with options, never its fallback.
- MUST end the turn for the human waits the table marks that way, and ask inline through the question tool — ending the turn only where the session exposes no such tool — for the ones it marks asked inline; never substitute one mechanism for the other by assumption.
- MUST apply the poll-or-dormancy mechanism choice to every machine wait in the table above, including the outer-cap case where no earlier expected-resolution time exists to time the single wake against instead.
- MUST treat non-convergence with no further round available as a human wait that ends the turn, never as a dormancy of any kind, since nothing is scheduled to wake it again on its own.
- MUST NOT merge the human and machine families into one procedure, and MUST NOT merge the end-turn and ask-inline mechanisms inside the human family into one; classify a new waiting place by what it actually is rather than by which document happens to describe it.

## Ending a Turn Is Not Going Dormant

The two outcomes are easy to blur, because both look the same from inside the loop: the run stops producing output and something else has to happen before it resumes. Their costs are opposite, and that is the distinction that matters.

**Ending a turn to wait on a human bills nothing at all until the human returns.** Nothing is scheduled and no cache boundary is at stake, because the resume is not a wake this run scheduled against an expected time — it is the human coming back, on whatever schedule is theirs. Whether that takes five minutes or five days, the run pays nothing in the interval; it pays only for the one turn that runs once they do.

**Going dormant to wait on a machine event pays a rebuild on resume.** A dormancy is, by the mechanism choice above, chosen precisely for a wait expected to outlast the boundary, and the wake that ends it is scheduled by the run itself against an expected time rather than triggered by someone returning. That wake resumes a cache that has necessarily gone cold — the condition a dormancy was chosen for in the first place — and pays the rebuild the tiered model above describes.

**Conflating the two is what makes a run reach for a self-wake where it should have ended the turn.** If ending a turn and going dormant read as one class — "the run has stopped, so something must be scheduled to start it again" — every human wait looks like it needs the same self-wake treatment a machine wait does, and a run defaults to polling for a human answer on a timer. That manufactures the several-middling-gaps cost forbidden above, for a channel — a human's own attention — a schedule cannot make arrive any sooner. Keeping the two outcomes distinct keeps a human wait costing nothing and a machine wait costing no more than its own shape requires.

**Guidelines:**

- MUST NOT schedule a self-wake for a human wait on the reasoning that the run has "stopped" and therefore needs something to start it again; a human wait is resumed by the human — whether that resumption ends the turn or answers a question asked inline in the same turn — never by a timer.
- MUST attribute a rebuild's cost to the dormancy that chose to wait past the boundary, not to the machine event being waited on, when explaining why a resume was expensive — the event did not decide that cost, the mechanism choice made before it did.
