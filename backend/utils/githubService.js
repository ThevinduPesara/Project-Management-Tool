const https = require('https');

/**
 * Fetch contributor statistics from GitHub API using built-in https module
 * @param {string} repo - Format 'owner/repo'
 * @returns {Promise<Array>} - List of contributors with their commit counts
 */
const fetchContributors = (repo) => {
    return new Promise((resolve, reject) => {
        const token = process.env.GITHUB_TOKEN;
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}/stats/contributors`,
            method: 'GET',
            headers: {
                'User-Agent': 'ITPM-Project-Tracker',
                ...(token ? { 'Authorization': `token ${token}` } : {})
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 202) {
                // GitHub is calculating the stats
                return resolve(null);
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsedData);
                    } else {
                        console.error(`GitHub API Error (${res.statusCode}):`, parsedData.message);
                        resolve([]);
                    }
                } catch (e) {
                    console.error('Error parsing GitHub response:', e.message);
                    resolve([]);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Error fetching GitHub contributors for ${repo}:`, error.message);
            resolve([]);
        });

        req.end();
    });
};

/**
 * Get commit statistics for a specific repo
 * @param {string} repo - Format 'owner/repo'
 * @returns {Promise<Object>} - Map of github usernames to total commits
 */
const getRepoCommitStats = async (repo) => {
    const contributors = await fetchContributors(repo);

    // If null, it means GitHub is still processing the request
    if (!contributors) return null;

    const stats = {};
    if (Array.isArray(contributors)) {
        contributors.forEach(contributor => {
            if (contributor.author && contributor.author.login) {
                stats[contributor.author.login.toLowerCase()] = contributor.total;
            }
        });
    }

    return stats;
};

module.exports = {
    fetchContributors,
    getRepoCommitStats
};
