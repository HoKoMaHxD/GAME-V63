const FETCH_BATCH_SIZE = 100;
const CLAN_PAGE_SIZE = 1000;
const human = member => member?.user?.bot === false && member.partial !== true;

// Commands live in the clan guild. The optional clan role lives in Arena.
export class ClanMembership {
  constructor({ bot, source, config }) {
    this.bot = bot;
    this.source = source;
    this.config = config;
    this.members = new Set();
    this.clan = new Map();
    this.arena = new Map();
    this.revisions = new Map();
    this.ready = false;
    this.epoch = 0;
    this.loading = null;
    this.changes = null;
  }

  has(id) { return this.ready && this.members.has(id); }

  invalidate() {
    this.epoch++;
    this.ready = false;
    this.members.clear();
  }

  hasArenaRole(member) {
    return human(member) && !!member.roles?.cache?.has(this.config.memberRole);
  }

  sync(id) {
    const before = this.members.has(id);
    if (this.ready && this.clan.get(id) && (!this.config.memberRole || this.arena.get(id))) this.members.add(id);
    else this.members.delete(id);
    return before !== this.members.has(id);
  }

  updateClan(member, removed = false) {
    if (member?.guild?.id !== this.config.clanGuildId) return false;
    const eligible = !removed && human(member);
    this.revisions.set(member.id, (this.revisions.get(member.id) || 0) + 1);
    this.clan.set(member.id, eligible);
    this.changes?.clan.set(member.id, eligible);
    return this.sync(member.id);
  }

  updateArena(member, removed = false) {
    if (!this.config.memberRole || member?.guild?.id !== this.config.arenaGuildId) return false;
    // Only retain role information for clan members (or while their initial list loads).
    if (!this.clan.has(member.id) && !this.changes) return false;
    const eligible = !removed && this.hasArenaRole(member);
    this.revisions.set(member.id, (this.revisions.get(member.id) || 0) + 1);
    this.arena.set(member.id, eligible);
    this.changes?.arena.set(member.id, eligible);
    return this.sync(member.id);
  }

  roleDeleted(role) {
    if (role?.guild?.id !== this.config.arenaGuildId || role.id !== this.config.memberRole) return false;
    this.invalidate();
    return true;
  }

  async loadArenaMember(id) {
    if (!this.ready || !this.config.memberRole || !this.clan.get(id)) return false;
    const epoch = this.epoch;
    const revision = this.revisions.get(id);
    const guild = this.source.guilds.cache.get(this.config.arenaGuildId);
    if (!guild) return false;
    const found = await guild.members.fetch({ user: [id], time: 60000, withPresences: false });
    if (epoch !== this.epoch || revision !== this.revisions.get(id)) return false;
    const member = found.get(id);
    return this.updateArena(member || { id, guild: { id: this.config.arenaGuildId } }, !member);
  }

  load() {
    if (this.loading) return this.loading;
    this.loading = this.loadSnapshot().finally(() => { this.loading = null; });
    return this.loading;
  }

  async loadClanMembers(guild, epoch) {
    const loaded = new Map();
    let after;
    // The official bot can page through REST without waiting for Gateway
    // member chunks. Do not trust a partial cache after a lost connection.
    while (epoch === this.epoch) {
      const page = await guild.members.list({ limit: CLAN_PAGE_SIZE, after, cache: false });
      if (epoch !== this.epoch) return null;
      for (const member of page.values()) loaded.set(member.id, member);
      if (page.size < CLAN_PAGE_SIZE) return loaded;
      const next = [...page.keys()].reduce((highest, id) => BigInt(id) > BigInt(highest) ? id : highest, '0');
      if (BigInt(next) <= BigInt(after || '0')) {
        throw Object.assign(new Error('تعذر استكمال صفحات أعضاء الكلان؛ لم تتقدم الصفحة التالية.'), { code: 'MEMBER_PAGINATION_STALLED' });
      }
      after = next;
    }
    return null;
  }

  async loadSnapshot() {
    this.invalidate();
    const epoch = this.epoch;
    const changes = { clan: new Map(), arena: new Map() };
    this.changes = changes;
    try {
      const clanGuild = this.bot.guilds.cache.get(this.config.clanGuildId);
      if (!clanGuild) throw new Error('البوت الرسمي غير موجود في سيرفر الكلان المحدد.');
      const arenaGuild = this.source.guilds.cache.get(this.config.arenaGuildId);
      if (this.config.memberRole) {
        if (!arenaGuild) throw new Error('حساب القارئ غير موجود في سيرفر أرينا المحدد.');
        if (!arenaGuild.roles.cache.has(this.config.memberRole)) {
          throw new Error('رتبة CLAN_MEMBER_ROLE_ID غير موجودة في سيرفر أرينا المحدد بواسطة ARENA_GUILD_ID.');
        }
      }
      const loaded = await this.loadClanMembers(clanGuild, epoch);
      if (!loaded || epoch !== this.epoch) return false;
      const clan = new Map([...loaded.values()].map(member => [member.id, human(member)]));
      for (const [id, eligible] of changes.clan) clan.set(id, eligible);
      const arena = new Map();
      if (this.config.memberRole) {
        const ids = [...clan].filter(([, eligible]) => eligible).map(([id]) => id);
        // Target known clan IDs instead of requesting every member of Arena.
        // Keep an array for one ID too, so both SDKs use Gateway member chunks.
        for (let offset = 0; offset < ids.length; offset += FETCH_BATCH_SIZE) {
          const batch = ids.slice(offset, offset + FETCH_BATCH_SIZE);
          const found = await arenaGuild.members.fetch({ user: batch, time: 60000, withPresences: false });
          if (epoch !== this.epoch) return false;
          for (const id of batch) arena.set(id, this.hasArenaRole(found.get(id)));
        }
      }
      // A role removal/leave received during a fetch must win over its older snapshot.
      for (const [id, eligible] of changes.clan) clan.set(id, eligible);
      for (const [id, eligible] of changes.arena) arena.set(id, eligible);
      this.clan = clan;
      this.arena = arena;
      // A join after the requested ID list was built needs another bounded refresh.
      this.ready = !this.config.memberRole || [...clan].every(([id, eligible]) => !eligible || arena.has(id));
      if (this.ready) for (const id of clan.keys()) this.sync(id);
      return this.ready;
    } finally {
      if (this.changes === changes) this.changes = null;
    }
  }
}
