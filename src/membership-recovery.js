const RETRY_BASE_MS = 30000;
const RETRY_MAX_MS = 300000;
const TRANSIENT_CODES = new Set(['GuildMembersTimeout', 'GUILD_MEMBERS_TIMEOUT',
  'ECONNABORTED', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT', 'UND_ERR_SOCKET']);

export function transientMembershipError(error) {
  const seen = new Set();
  while (error && !seen.has(error)) {
    seen.add(error);
    if (TRANSIENT_CODES.has(error.code) || ['AbortError', 'TimeoutError', 'GatewayRateLimitError'].includes(error.name)
      || error.status === 429 || error.status >= 500) return true;
    error = error.cause;
  }
  return false;
}

// Both the Gateway resume event and the voice timer use this one attempt.
// Backoff is checked by those callers; no sleeping job holds up a voice tick.
export class MembershipRecovery {
  constructor({ membership, canRun = () => true, beforeLoad = () => {}, onError = () => {}, clock = Date.now }) {
    Object.assign(this, { membership, canRun, beforeLoad, onError, clock });
    this.pending = null;
    this.failures = 0;
    this.retryAt = 0;
  }

  run({ required = false } = {}) {
    if (!this.canRun()) return Promise.resolve(false);
    if (this.membership.ready) return Promise.resolve(true);
    if (this.pending) return this.pending;
    if (this.clock() < this.retryAt) return Promise.resolve(false);
    this.pending = Promise.resolve().then(() => {
      if (!this.canRun()) return false;
      this.beforeLoad();
      return this.membership.load();
    }).then(ready => {
      if (ready) { this.failures = 0; this.retryAt = 0; }
      return ready;
    }).catch(error => {
      if (error.code === 'RESET_INTERRUPTED') return false;
      // Invalid IDs, permissions and configuration still fail fast at startup.
      if (required && !transientMembershipError(error)) throw error;
      const delayMs = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** Math.min(this.failures++, 4));
      this.retryAt = this.clock() + delayMs;
      this.onError(error, delayMs);
      return false;
    }).finally(() => { this.pending = null; });
    return this.pending;
  }
}
