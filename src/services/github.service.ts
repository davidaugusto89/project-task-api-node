import axios from 'axios';

import { cache } from './cache.service';
import { ProjectsRepo } from '../repositories/projects.repo';

type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Busca os 5 repositórios mais recentes do GitHub de um usuário e associa ao projeto informado.
 * Utiliza cache para evitar requisições repetidas à API do GitHub.
 *
 * @param {number} projectId - ID do projeto ao qual os repositórios serão associados.
 * @param {string} username - Nome de usuário do GitHub.
 * @returns {Promise<{ projectId: number; username: string; repos: GitHubRepo[] }>} Objeto com ID do projeto, username e lista de repositórios.
 * @throws {Error} Se o projeto não for encontrado ou ocorrer erro na requisição ao GitHub.
 * @example
 * await GitHubService.fetchAndAttach(1, 'octocat');
 */
export const GitHubService = {
  async fetchAndAttach(projectId: number, username: string) {
    const project = await ProjectsRepo.findById(projectId);
    if (!project) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 });

    const cacheKey = `gh:${username}:last5`;
    let repos = cache.get<GitHubRepo[]>(cacheKey);

    if (!repos) {
      const { data } = await axios.get<GitHubRepo[]>(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos`,
        {
          headers: {
            'User-Agent': 'projects-api',
            Accept: 'application/vnd.github+json',
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
          params: { per_page: 100, sort: 'updated' },
          timeout: 10000,
        },
      );
      repos = data
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          name: r.name,
          html_url: r.html_url,
          description: r.description,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }));
      cache.set(cacheKey, repos);
    }

    await project.update({ githubRepos: repos });
    return { projectId: project.id, username, repos };
  },
};
