import axios from 'axios';

const baseUrl = 'https://dev.altinn.studio/repos/api/v1';

export async function getOrgs() {
  try {
    const response = await axios.get(`${baseUrl}/orgs`, {
      headers: {
        Authorization: `token ${process.env.MY_GITEA_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log('getOrgs error: ', error.response?.status);
  }
}

export async function getRepos(orgId: string) {
  try {
    const response = await axios.get(
      `${baseUrl}/repos/search?uid=${orgId}&sort=updated&order=desc`,
      {
        headers: {
          Authorization: `token ${process.env.MY_GITEA_TOKEN}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('getRepos error: ', error.response?.status);
  }
}

export async function getCommits(repoId: string) {
  try {
    const response = await axios.get(`${baseUrl}/repos/${repoId}/commits`, {
      headers: {
        Authorization: `token ${process.env.MY_GITEA_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log('getCommits error: ', error.response?.status);
  }
}

export async function getNotes(owner: string, repo: string, commitId: string) {
  try {
    const response = await axios.get(`${baseUrl}/repos/${owner}/${repo}/git/notes/${commitId}`, {
      headers: {
        Authorization: `token ${process.env.MY_GITEA_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log('getNotes error: ', error.response?.status);
  }
}
