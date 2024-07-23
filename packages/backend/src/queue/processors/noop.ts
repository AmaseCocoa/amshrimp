import Bull from "bull";

// Processor to be registered for jobs with __default__ (unnamed) handlers in queues that only have named handlers
// Prevents sporadic bogus jobs from clogging up the queues
export async function noop(_: Bull.Job): Promise<void> { }
