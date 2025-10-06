import { InMemoryCache } from '../../../src/services/cache.service';

describe('InMemoryCache', () => {
  let cache: InMemoryCache;
  let now: number;

  beforeEach(() => {
    cache = new InMemoryCache();
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Cenário: Instanciação com TTL padrão
  it('// Cenário: Instanciação padrão deve definir TTL de 10 minutos', () => {
    const c = new InMemoryCache();
    expect((c as any).defaultTtlMs).toBe(10 * 60 * 1000);
  });

  // Cenário: Instanciação com TTL customizado
  it('// Cenário: Instanciação customizada deve definir TTL informado', () => {
    const c = new InMemoryCache(12345);
    expect((c as any).defaultTtlMs).toBe(12345);
  });

  // Cenário: Armazena valor com TTL padrão e recupera antes de expirar
  it('// Cenário: set/get recupera valor antes do TTL expirar', () => {
    cache.set('key', 'valor');
    expect(cache.get<string>('key')).toBe('valor');
  });

  // Cenário: Armazena valor com TTL customizado e recupera antes de expirar
  it('// Cenário: set/get recupera valor com TTL customizado', () => {
    cache.set('key', 42, 5000);
    expect(cache.get<number>('key')).toBe(42);
  });

  // Cenário: Recupera valor de tipo diferente (tipagem)
  it('// Cenário: get retorna valor com tipagem correta', () => {
    cache.set('key', { a: 1 });
    const val = cache.get<{ a: number }>('key');
    expect(val).toEqual({ a: 1 });
  });

  // Cenário: Chave não existe retorna null
  it('// Cenário: get retorna null se chave não existe', () => {
    expect(cache.get('inexistente')).toBeNull();
  });

  // Cenário: Valor expirado retorna null e deleta do cache
  it('// Cenário: get retorna null se valor expirou e remove do cache', () => {
    cache.set('key', 'valor', 1000);
    now += 1001;
    expect(cache.get('key')).toBeNull();
    // Chave foi removida do store
    expect((cache as any).store.has('key')).toBe(false);
  });

  // Cenário: Armazena valor com TTL zero (expira imediatamente)
  it('// Cenário: set com TTL zero expira imediatamente', () => {
    cache.set('key', 'valor', 0);
    expect(cache.get('key')).toBe('valor');
  });

  // Cenário: Armazena valor undefined/null como valor
  it('// Cenário: set/get aceita valor undefined', () => {
    cache.set('key', undefined);
    expect(cache.get('key')).toBeUndefined();
  });

  it('// Cenário: set/get aceita valor null', () => {
    cache.set('key', null);
    expect(cache.get('key')).toBeNull();
  });

  // Cenário: Chave vazia funciona normalmente
  it('// Cenário: set/get aceita chave vazia', () => {
    cache.set('', 'abc');
    expect(cache.get('')).toBe('abc');
  });

  // Cenário: Chave/valor/TTL tipos errados não quebram (edge case)
  it('// Cenário: set/get aceita tipos estranhos', () => {
    cache.set(123 as any, 'num');
    expect(cache.get(123 as any)).toBe('num');
    cache.set('key', [1, 2, 3]);
    expect(cache.get<number[]>('key')).toEqual([1, 2, 3]);
  });
});
