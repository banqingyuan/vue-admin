import type { RequestClient } from './request-client';

/**
 * RequestClientManager - 管理多个 RequestClient 实例
 * 用于支持多个 baseURL/domain 的场景
 *
 * 使用示例:
 * ```typescript
 * const manager = new RequestClientManager();
 * manager.registerClient('main', mainRequestClient);
 * manager.registerClient('agent', agentRequestClient);
 *
 * const mainClient = manager.getClient('main');
 * const agentClient = manager.getClient('agent');
 * ```
 */
export class RequestClientManager {
  /**
   * 获取已注册的客户端数量
   * @returns 客户端数量
   */
  get size(): number {
    return this.clients.size;
  }
  private clients: Map<string, RequestClient>;

  private defaultClientName?: string;

  constructor() {
    this.clients = new Map();
  }

  /**
   * 清空所有已注册的客户端
   */
  clear(): void {
    this.clients.clear();
    this.defaultClientName = undefined;
  }

  /**
   * 获取指定名称的 RequestClient 实例
   * @param name - 客户端名称，如果不提供则返回默认客户端
   * @returns RequestClient 实例
   * @throws 如果找不到指定名称的客户端
   */
  getClient(name?: string): RequestClient {
    const targetName = name || this.defaultClientName;

    if (!targetName) {
      throw new Error(
        'No client name provided and no default client is set. Please register a client first.',
      );
    }

    const client = this.clients.get(targetName);

    if (!client) {
      throw new Error(
        `RequestClient with name "${targetName}" not found. Available clients: ${[...this.clients.keys()].join(', ')}`,
      );
    }

    return client;
  }

  /**
   * 获取所有已注册的客户端名称列表
   * @returns 客户端名称数组
   */
  getClientNames(): string[] {
    return [...this.clients.keys()];
  }

  /**
   * 获取默认客户端名称
   * @returns 默认客户端名称，如果没有则返回 undefined
   */
  getDefaultClientName(): string | undefined {
    return this.defaultClientName;
  }

  /**
   * 检查是否存在指定名称的客户端
   * @param name - 客户端名称
   * @returns 是否存在
   */
  hasClient(name: string): boolean {
    return this.clients.has(name);
  }

  /**
   * 注册一个 RequestClient 实例
   * @param name - 客户端名称（唯一标识）
   * @param client - RequestClient 实例
   * @param isDefault - 是否设置为默认客户端
   */
  registerClient(
    name: string,
    client: RequestClient,
    isDefault: boolean = false,
  ): void {
    if (this.clients.has(name)) {
      console.warn(
        `RequestClient with name "${name}" already exists, it will be replaced.`,
      );
    }

    this.clients.set(name, client);

    if (isDefault || this.clients.size === 1) {
      this.defaultClientName = name;
    }
  }

  /**
   * 设置默认客户端
   * @param name - 客户端名称
   * @throws 如果找不到指定名称的客户端
   */
  setDefaultClient(name: string): void {
    if (!this.clients.has(name)) {
      throw new Error(
        `Cannot set default client: RequestClient with name "${name}" not found.`,
      );
    }
    this.defaultClientName = name;
  }

  /**
   * 注销指定名称的 RequestClient
   * @param name - 客户端名称
   * @returns 是否成功注销
   */
  unregisterClient(name: string): boolean {
    const result = this.clients.delete(name);

    // 如果注销的是默认客户端，重置默认客户端
    if (result && this.defaultClientName === name) {
      const remainingClients = [...this.clients.keys()];
      this.defaultClientName =
        remainingClients.length > 0 ? remainingClients[0] : undefined;
    }

    return result;
  }
}
