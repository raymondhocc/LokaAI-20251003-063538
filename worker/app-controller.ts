import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, BrandTerm, HistoryItem } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private brandTerms = new Map<string, BrandTerm>();
  private history = new Map<string, HistoryItem>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<SessionInfo | BrandTerm | HistoryItem>();
      for (const [key, value] of stored) {
        if (key.startsWith('session:')) {
          this.sessions.set(key.replace('session:', ''), value as SessionInfo);
        } else if (key.startsWith('brandTerm:')) {
          this.brandTerms.set(key.replace('brandTerm:', ''), value as BrandTerm);
        } else if (key.startsWith('history:')) {
          this.history.set(key.replace('history:', ''), value as HistoryItem);
        }
      }
      this.loaded = true;
    }
  }

  // Session Management
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    const newSession: SessionInfo = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    };
    this.sessions.set(sessionId, newSession);
    await this.ctx.storage.put(`session:${sessionId}`, newSession);
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      await this.ctx.storage.delete(`session:${sessionId}`);
    }
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.ctx.storage.put(`session:${sessionId}`, session);
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.ctx.storage.put(`session:${sessionId}`, session);
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    const keysToDelete = Array.from(this.sessions.keys()).map(id => `session:${id}`);
    this.sessions.clear();
    if (keysToDelete.length > 0) {
      await this.ctx.storage.delete(keysToDelete);
    }
    return count;
  }
  // Brand Terms Management
  async listBrandTerms(): Promise<BrandTerm[]> {
    await this.ensureLoaded();
    return Array.from(this.brandTerms.values()).sort((a, b) => a.term.localeCompare(b.term));
  }
  async addBrandTerm(termData: Omit<BrandTerm, 'id'>): Promise<BrandTerm> {
    await this.ensureLoaded();
    const newTerm: BrandTerm = {
      ...termData,
      id: crypto.randomUUID(),
    };
    this.brandTerms.set(newTerm.id, newTerm);
    await this.ctx.storage.put(`brandTerm:${newTerm.id}`, newTerm);
    return newTerm;
  }
  async updateBrandTerm(term: BrandTerm): Promise<boolean> {
    await this.ensureLoaded();
    if (!this.brandTerms.has(term.id)) {
      return false;
    }
    this.brandTerms.set(term.id, term);
    await this.ctx.storage.put(`brandTerm:${term.id}`, term);
    return true;
  }
  async deleteBrandTerm(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.brandTerms.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`brandTerm:${id}`);
    }
    return deleted;
  }
  async updateBrandTermTranslations(id: string, translations: Record<string, string>): Promise<boolean> {
    await this.ensureLoaded();
    const term = this.brandTerms.get(id);
    if (!term) {
      return false;
    }
    term.translations = translations;
    this.brandTerms.set(id, term);
    await this.ctx.storage.put(`brandTerm:${id}`, term);
    return true;
  }
  // History Management
  async listHistory(): Promise<HistoryItem[]> {
    await this.ensureLoaded();
    return Array.from(this.history.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async addHistoryItem(itemData: Omit<HistoryItem, 'id' | 'date'>): Promise<HistoryItem> {
    await this.ensureLoaded();
    const newItem: HistoryItem = {
      ...itemData,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    this.history.set(newItem.id, newItem);
    await this.ctx.storage.put(`history:${newItem.id}`, newItem);
    return newItem;
  }
}