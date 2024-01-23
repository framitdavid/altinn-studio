import { getCommits, getOrgs, getRepos } from './GiteaApiWrapper';

const org = 'nkylstad';
const repo = 'add-new-nina';

const run = async () => {
  // const orgs = await getOrgs();
  // const ttdOrg = orgs.find((org) => org.name === 'ttd');

  // const repos = await getRepos(ttdOrg.id);
  // console.log(repos.data.map((repo) => repo.name));
  // const frontendTestRepo = repos.data.find((repo) => repo.name === 'frontend-test');

  const commits = await getCommits(`${org}/${repo}`);
  const relevantCommits = commits.filter((commit) => commit.created.startsWith('2024-'));
  // console.log(relevantCommits);

  const studioCommits = relevantCommits.filter(
    (commit) => commit.commit?.author?.email === '@jugglingnutcase',
  );
  console.log('relevant commits: ', relevantCommits.length);
  console.log('Studio commits: ', studioCommits.length);
};

run();
