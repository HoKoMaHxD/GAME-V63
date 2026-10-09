import { eligibleVoice } from './domain.js';

export class VoiceTracker {
  constructor({ service, guildId, onError = () => {} }) {
    Object.assign(this, { service, guildId, onError });
    this.snapshot = []; this.rule = null; this.last = null;
    this.epoch = 0; this.tail = Promise.resolve();
    // Only intervals captured while eligibility was known are queued. Per-user
    // ordering plus the stored voiceUntil watermark make retries idempotent.
    this.pending = new Map();
  }
  enqueue(action) {
    const epoch = this.epoch;
    const operation = this.tail.then(() => epoch === this.epoch ? action() : undefined);
    this.tail = operation.catch(error => {
      if (!error.voiceRetryable) this.drop();
      this.onError(error);
    });
    return operation;
  }
  transition(snapshot, rule, memberIds, at) {
    const eligible = eligibleVoice(snapshot, rule, memberIds);
    const epoch = this.epoch;
    return this.enqueue(async () => {
      try { await this.flush(at); }
      finally {
        // A persistence error must not keep somebody in the room they just left.
        if (epoch === this.epoch) {
          this.snapshot = eligible; this.rule = structuredClone(rule); this.last = at;
        }
      }
    });
  }
  tick(at) { return this.enqueue(() => this.flush(at)); }
  async flush(at) {
    const from = this.last; this.last = at;
    // Never infer time across an unobserved stall/disconnection.
    if (from !== null && at > from && at - from <= 60000 && this.rule) {
      for (const member of this.snapshot) {
        if (!this.pending.has(member.userId)) this.pending.set(member.userId, []);
        this.pending.get(member.userId).push({ event: {
          guildId: this.guildId, userId: member.userId, channelId: member.channelId,
          ...(member.categoryId ? { categoryId: member.categoryId } : {}),
          from, to: at, eligible: true
        }, rule: structuredClone(this.rule) });
      }
    }
    const epoch = this.epoch, jobs = [...this.pending], failures = [];
    let cursor = 0;
    // Bounded parallelism avoids one slow member delaying every other member.
    const worker = async () => {
      while (cursor < jobs.length && epoch === this.epoch) {
        const [id, queue] = jobs[cursor++];
        while (queue.length && epoch === this.epoch) {
          try { await this.service.voice(queue[0].event, queue[0].rule); queue.shift(); }
          catch (error) { failures.push(error); break; }
        }
        if (!queue.length) this.pending.delete(id);
      }
    };
    await Promise.all(Array.from({ length: Math.min(8, jobs.length) }, worker));
    if (failures.length) throw Object.assign(new Error(`تعذر حفظ وقت الصوت لـ ${failures.length} عضو؛ ستعاد محاولة الفترات المرصودة.`, { cause: failures[0] }), { voiceRetryable: true });
  }
  drop() {
    this.epoch++; this.snapshot = []; this.last = null; this.rule = null;
    // Keep previously observed intervals; never add disconnected time.
  }
  async drain() { await this.tail; }
}
