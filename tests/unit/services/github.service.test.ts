jest.mock('axios');
jest.mock('../../../src/services/cache.service', () => ({
  cache: { get: jest.fn(), set: jest.fn() },
}));
jest.mock('../../../src/repositories/projects.repo', () => ({
  ProjectsRepo: { findById: jest.fn() },
}));

import axios from 'axios';

import { ProjectsRepo } from '../../../src/repositories/projects.repo';
import { cache } from '../../../src/services/cache.service';
import { GitHubService } from '../../../src/services/github.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCache = cache as unknown as { get: jest.Mock; set: jest.Mock };
const mockedProjectsRepo = ProjectsRepo as unknown as { findById: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
  delete process.env.GITHUB_TOKEN;
});

describe('GitHubService.fetchAndAttach', () => {
  // Cenário: projeto inexistente -> deve lançar erro 404
  it('throws 404 when Projeto não encontrado', async () => {
    // Arrange
    mockedProjectsRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(GitHubService.fetchAndAttach(1, 'any')).rejects.toMatchObject({
      message: 'Projeto não encontrado',
      status: 404,
    });

    expect(mockedProjectsRepo.findById).toHaveBeenCalledWith(1);
  });

  // Cenário: cache contém os repositórios -> não deve chamar axios e deve usar cache
  it('uses cached repos when available and updates project', async () => {
    // Arrange
    const cached = [
      {
        id: 1,
        name: 'r1',
        html_url: 'http://x/1',
        description: null,
        stargazers_count: 0,
        forks_count: 0,
        language: null,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-02T00:00:00Z',
      },
    ] as const;

    const project = { id: 42, update: jest.fn().mockResolvedValue(undefined) };
    mockedProjectsRepo.findById.mockResolvedValue(project);
    mockedCache.get.mockReturnValue(cached);

    // Act
    const res = await GitHubService.fetchAndAttach(42, 'me');

    // Assert
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(project.update).toHaveBeenCalledWith({ githubRepos: cached });
    expect(res).toEqual({ projectId: 42, username: 'me', repos: cached });
  });

  // Cenário: cache vazio -> faz request ao GitHub, mapeia, seta cache e atualiza projeto (com token)
  it('fetches from GitHub when cache miss, sets cache and updates project (with token)', async () => {
    // Arrange
    process.env.GITHUB_TOKEN = 'secrettoken';
    mockedCache.get.mockReturnValue(undefined);

    const repoItems = [
      {
        id: 1,
        name: 'a',
        html_url: 'u1',
        description: null,
        stargazers_count: 1,
        forks_count: 1,
        language: 'TS',
        created_at: '2020-01-01',
        updated_at: '2020-01-10',
      },
      {
        id: 2,
        name: 'b',
        html_url: 'u2',
        description: 'd',
        stargazers_count: 2,
        forks_count: 2,
        language: 'JS',
        created_at: '2020-01-01',
        updated_at: '2020-01-09',
      },
      {
        id: 3,
        name: 'c',
        html_url: 'u3',
        description: null,
        stargazers_count: 3,
        forks_count: 3,
        language: null,
        created_at: '2020-01-01',
        updated_at: '2020-01-08',
      },
      {
        id: 4,
        name: 'd',
        html_url: 'u4',
        description: null,
        stargazers_count: 4,
        forks_count: 4,
        language: 'Go',
        created_at: '2020-01-01',
        updated_at: '2020-01-07',
      },
      {
        id: 5,
        name: 'e',
        html_url: 'u5',
        description: null,
        stargazers_count: 5,
        forks_count: 5,
        language: 'Py',
        created_at: '2020-01-01',
        updated_at: '2020-01-06',
      },
      {
        id: 6,
        name: 'f',
        html_url: 'u6',
        description: null,
        stargazers_count: 6,
        forks_count: 6,
        language: 'Rust',
        created_at: '2020-01-01',
        updated_at: '2020-01-05',
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: repoItems });

    const project = { id: 7, update: jest.fn().mockResolvedValue(undefined) };
    mockedProjectsRepo.findById.mockResolvedValue(project);

    // Act
    const res = await GitHubService.fetchAndAttach(7, 'token-user');

    // Assert
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain('users/token-user/repos');
    const options = mockedAxios.get.mock.calls[0][1] as any;
    expect(options.headers.Authorization).toBe(`Bearer ${process.env.GITHUB_TOKEN}`);

    expect(mockedCache.set).toHaveBeenCalledTimes(1);
    const cachedArg = mockedCache.set.mock.calls[0][1];
    expect(Array.isArray(cachedArg)).toBe(true);
    expect(cachedArg).toHaveLength(5);

    expect(project.update).toHaveBeenCalledWith({ githubRepos: cachedArg });
    expect(res).toEqual({ projectId: 7, username: 'token-user', repos: cachedArg });
  });

  // Cenário: cache vazio -> faz request ao GitHub sem token (sem Authorization header)
  it('fetches from GitHub when cache miss and no token present (no Authorization header)', async () => {
    // Arrange
    mockedCache.get.mockReturnValue(undefined);
    mockedAxios.get.mockResolvedValue({ data: [] });

    const project = { id: 8, update: jest.fn().mockResolvedValue(undefined) };
    mockedProjectsRepo.findById.mockResolvedValue(project);

    // Act
    const res = await GitHubService.fetchAndAttach(8, 'user with space');

    // Assert
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent('user with space'));
    const options = mockedAxios.get.mock.calls[0][1] as any;
    expect(options.headers.Authorization).toBeUndefined();

    expect(mockedCache.set).toHaveBeenCalledWith('gh:user with space:last5', []);
    expect(project.update).toHaveBeenCalledWith({ githubRepos: [] });
    expect(res).toEqual({ projectId: 8, username: 'user with space', repos: [] });
  });

  // Cenário: error na requisição axios -> propaga erro
  it('propagates axios error when request fails', async () => {
    // Arrange
    mockedCache.get.mockReturnValue(undefined);
    const networkErr = new Error('Network fail');
    mockedAxios.get.mockRejectedValue(networkErr);

    const project = { id: 9, update: jest.fn().mockResolvedValue(undefined) };
    mockedProjectsRepo.findById.mockResolvedValue(project);

    // Act & Assert
    await expect(GitHubService.fetchAndAttach(9, 'erruser')).rejects.toBe(networkErr);
  });
});
