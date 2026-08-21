<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Glossary

The words this project uses, and what each means here. The first half is the
product's vocabulary, grouped by the spec that details each domain; the second is the
vocabulary of building and running the repository, grouped by the document that owns
it. A term earns an entry when a newcomer would otherwise have to infer it; a word
whose ordinary meaning is already exact is left out.

# Product vocabulary

## Scheduling

**Job Template** — the reusable definition a **Job** is created from. It holds the
work to be run and, optionally, the **Schedule** that creates **Jobs** from it
without anyone asking.

**Schedule** — the recurrence attached to a **Job Template**, evaluated in UTC. A
template without one produces **Jobs** only when someone runs it by hand.

**Job** — one execution of a **Job Template**, created when the template's
**Schedule** fires or when someone runs the template by hand.

**Attempt** — one try at running a **Job**. A **Job** that failed and was retried has
more than one, and its outcome is the last attempt's.

**Job output** — what a **Job** produced, kept after the **Job**'s own record is
pruned.

## Notifications

**Notification Rule** — the standing instruction that turns a **Job**'s outcome into
a message, owned by the account rather than by any one **Job Template**.

**Channel** — where a **Notification Rule** delivers: an email address, a webhook, or
a chat integration. A rule names one, and a channel serves many rules.

**Digest** — one message standing for several outcomes that a **Notification Rule**
would otherwise have sent separately, emitted on a fixed interval rather than per
**Job**.

# Development vocabulary

## Directory Structure

**Package** — one of the two deployables, `api` and `worker`, which release
independently and therefore may not import each other.
