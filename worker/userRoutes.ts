import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { BrandTerm, HistoryItem } from "./types";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Session Management Routes
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') return c.json({ success: false, error: 'Title is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({ success: false, error: 'Failed to update session title' }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({ success: true, data: { deletedCount } });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({ success: false, error: 'Failed to clear all sessions' }, { status: 500 });
        }
    });
    // Brand Terms CRUD Routes
    app.get('/api/brand-terms', async (c) => {
        try {
            const controller = getAppController(c.env);
            const terms = await controller.listBrandTerms();
            return c.json({ success: true, data: terms });
        } catch (error) {
            console.error('Failed to list brand terms:', error);
            return c.json({ success: false, error: 'Failed to retrieve brand terms' }, { status: 500 });
        }
    });
    app.post('/api/brand-terms', async (c) => {
        try {
            const body = await c.req.json<Omit<BrandTerm, 'id'>>();
            if (!body.term) return c.json({ success: false, error: 'Term is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const newTerm = await controller.addBrandTerm(body);
            return c.json({ success: true, data: newTerm }, 201);
        } catch (error) {
            console.error('Failed to add brand term:', error);
            return c.json({ success: false, error: 'Failed to add brand term' }, { status: 500 });
        }
    });
    app.put('/api/brand-terms/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const body = await c.req.json<Omit<BrandTerm, 'id'>>();
            if (!body.term) return c.json({ success: false, error: 'Term is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const updated = await controller.updateBrandTerm({ ...body, id });
            if (!updated) return c.json({ success: false, error: 'Brand term not found' }, { status: 404 });
            return c.json({ success: true, data: { id } });
        } catch (error) {
            console.error('Failed to update brand term:', error);
            return c.json({ success: false, error: 'Failed to update brand term' }, { status: 500 });
        }
    });
    app.delete('/api/brand-terms/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const controller = getAppController(c.env);
            const deleted = await controller.deleteBrandTerm(id);
            if (!deleted) return c.json({ success: false, error: 'Brand term not found' }, { status: 404 });
            return c.json({ success: true, data: { id } });
        } catch (error) {
            console.error('Failed to delete brand term:', error);
            return c.json({ success: false, error: 'Failed to delete brand term' }, { status: 500 });
        }
    });
    app.put('/api/brand-terms/:id/translations', async (c) => {
        try {
            const id = c.req.param('id');
            const translations = await c.req.json<Record<string, string>>();
            const controller = getAppController(c.env);
            const updated = await controller.updateBrandTermTranslations(id, translations);
            if (!updated) {
                return c.json({ success: false, error: 'Brand term not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { id } });
        } catch (error) {
            console.error('Failed to update brand term translations:', error);
            return c.json({ success: false, error: 'Failed to update translations' }, { status: 500 });
        }
    });
    // History Routes
    app.get('/api/history', async (c) => {
        try {
            const controller = getAppController(c.env);
            const history = await controller.listHistory();
            return c.json({ success: true, data: history });
        } catch (error) {
            console.error('Failed to list history:', error);
            return c.json({ success: false, error: 'Failed to retrieve history' }, { status: 500 });
        }
    });
    app.post('/api/history', async (c) => {
        try {
            const body = await c.req.json<Omit<HistoryItem, 'id' | 'date'>>();
            if (!body.sourceText || !body.languages) {
                return c.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const newItem = await controller.addHistoryItem(body);
            return c.json({ success: true, data: newItem }, 201);
        } catch (error) {
            console.error('Failed to add history item:', error);
            return c.json({ success: false, error: 'Failed to add history item' }, { status: 500 });
        }
    });
}