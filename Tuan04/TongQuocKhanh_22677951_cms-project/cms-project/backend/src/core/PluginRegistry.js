class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.hooks   = new Map();
  }

  register(name, plugin) {
    if (this.plugins.has(name)) throw new Error(`Plugin "${name}" already registered`);
    this.plugins.set(name, plugin);
    if (typeof plugin.register === 'function') plugin.register(this);
    console.log(`[Plugin] "${name}" registered`);
  }

  on(hookName, handler, priority = 10) {
    if (!this.hooks.has(hookName)) this.hooks.set(hookName, []);
    this.hooks.get(hookName).push({ handler, priority });
    this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);
  }

  async fire(hookName, context = {}) {
    for (const { handler } of this.hooks.get(hookName) || []) {
      await handler(context);
    }
    return context;
  }

  listPlugins() { return [...this.plugins.keys()]; }
}

module.exports = new PluginRegistry();
