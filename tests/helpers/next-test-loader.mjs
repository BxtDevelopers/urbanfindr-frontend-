export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server') {
    return nextResolve('next/server.js', context);
  }
  if (specifier === 'next/headers') {
    return {
      url: 'virtual:next-headers-test-mock',
      shortCircuit: true
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === 'virtual:next-headers-test-mock') {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        export async function cookies() {
          const jar = globalThis.__UF_TEST_COOKIE_STORE__ || (globalThis.__UF_TEST_COOKIE_STORE__ = new Map());
          return {
            get(name) {
              const value = jar.get(name);
              return value === undefined ? undefined : { name, value };
            },
            set(name, value) {
              jar.set(name, typeof value === 'object' && value !== null ? value.value : value);
            },
            delete(name) {
              jar.delete(name);
            }
          };
        }
      `
    };
  }
  return nextLoad(url, context);
}
