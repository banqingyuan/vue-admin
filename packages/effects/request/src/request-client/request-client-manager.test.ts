import { beforeEach, describe, expect, it } from 'vitest';

import { RequestClient } from './request-client';
import { RequestClientManager } from './request-client-manager';

describe('requestClientManager', () => {
  let manager: RequestClientManager;
  let mainClient: RequestClient;
  let agentClient: RequestClient;

  beforeEach(() => {
    manager = new RequestClientManager();
    mainClient = new RequestClient({ baseURL: 'https://api.main.com' });
    agentClient = new RequestClient({ baseURL: 'https://api.agent.com' });
  });

  it('should register and get a client', () => {
    manager.registerClient('main', mainClient);
    expect(manager.getClient('main')).toBe(mainClient);
  });

  it('should set first registered client as default', () => {
    manager.registerClient('main', mainClient);
    expect(manager.getDefaultClientName()).toBe('main');
    expect(manager.getClient()).toBe(mainClient);
  });

  it('should allow setting a specific default client', () => {
    manager.registerClient('main', mainClient);
    manager.registerClient('agent', agentClient);
    manager.setDefaultClient('agent');
    expect(manager.getDefaultClientName()).toBe('agent');
    expect(manager.getClient()).toBe(agentClient);
  });

  it('should throw error when getting non-existent client', () => {
    expect(() => manager.getClient('nonexistent')).toThrow(
      'RequestClient with name "nonexistent" not found',
    );
  });

  it('should throw error when no default client and no name provided', () => {
    expect(() => manager.getClient()).toThrow(
      'No client name provided and no default client is set',
    );
  });

  it('should replace existing client with warning', () => {
    manager.registerClient('main', mainClient);
    const newMainClient = new RequestClient({
      baseURL: 'https://api.newmain.com',
    });
    manager.registerClient('main', newMainClient);
    expect(manager.getClient('main')).toBe(newMainClient);
  });

  it('should check if client exists', () => {
    manager.registerClient('main', mainClient);
    expect(manager.hasClient('main')).toBe(true);
    expect(manager.hasClient('nonexistent')).toBe(false);
  });

  it('should get all client names', () => {
    manager.registerClient('main', mainClient);
    manager.registerClient('agent', agentClient);
    const names = manager.getClientNames();
    expect(names).toContain('main');
    expect(names).toContain('agent');
    expect(names).toHaveLength(2);
  });

  it('should unregister a client', () => {
    manager.registerClient('main', mainClient);
    expect(manager.hasClient('main')).toBe(true);
    const result = manager.unregisterClient('main');
    expect(result).toBe(true);
    expect(manager.hasClient('main')).toBe(false);
  });

  it('should update default client when default is unregistered', () => {
    manager.registerClient('main', mainClient);
    manager.registerClient('agent', agentClient);
    expect(manager.getDefaultClientName()).toBe('main');
    manager.unregisterClient('main');
    expect(manager.getDefaultClientName()).toBe('agent');
  });

  it('should clear all clients', () => {
    manager.registerClient('main', mainClient);
    manager.registerClient('agent', agentClient);
    expect(manager.size).toBe(2);
    manager.clear();
    expect(manager.size).toBe(0);
    expect(manager.getDefaultClientName()).toBeUndefined();
  });

  it('should throw error when setting non-existent default client', () => {
    expect(() => manager.setDefaultClient('nonexistent')).toThrow(
      'Cannot set default client: RequestClient with name "nonexistent" not found',
    );
  });

  it('should mark explicitly set default client', () => {
    manager.registerClient('main', mainClient, false);
    manager.registerClient('agent', agentClient, true);
    expect(manager.getDefaultClientName()).toBe('agent');
  });

  it('should return correct size', () => {
    expect(manager.size).toBe(0);
    manager.registerClient('main', mainClient);
    expect(manager.size).toBe(1);
    manager.registerClient('agent', agentClient);
    expect(manager.size).toBe(2);
  });
});
