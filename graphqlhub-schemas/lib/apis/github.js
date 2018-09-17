'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStatusesForRepo = exports.getTreeForRepo = exports.getCommentsForIssue = exports.getIssuesForRepo = exports.getRepoForUser = exports.getBranchesForRepo = exports.getCommitsForRepo = exports.getReposForUser = exports.getUser = undefined;

var _githubApi = require('github-api');

var _githubApi2 = _interopRequireDefault(_githubApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var github = new _githubApi2.default({
  token: process.env.GITHUB_TOKEN,
  auth: 'oauth'
});

var getUser = exports.getUser = function getUser(username) {
  var user = github.getUser();
  return new Promise(function (resolve, reject) {
    user.show(username, function (err, user) {
      if (user) {
        resolve(user);
      } else {
        reject(err);
      }
    });
  });
};

var getReposForUser = exports.getReposForUser = function getReposForUser(username) {
  var user = github.getUser();
  return new Promise(function (resolve, reject) {
    user.userRepos(username, function (err, repos) {
      if (repos) {
        resolve(repos);
      } else {
        reject(err);
      }
    });
  });
};

var getCommitsForRepo = exports.getCommitsForRepo = function getCommitsForRepo(username, reponame) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var repo = github.getRepo(username, reponame);
  var params = {};
  if (options.limit) params.perpage = options.limit;
  if (options.path) params.path = options.path;
  if (options.sha) params.sha = options.sha;

  return new Promise(function (resolve, reject) {
    repo.getCommits(params, function (err, commits) {
      if (commits) {
        resolve(commits);
      } else {
        reject(err);
      }
    });
  });
};

var getBranchesLastCommits = function getBranchesLastCommits(repo, branchNames) {
  return branchNames.map(function (name) {
    return new Promise(function (resolve, reject) {
      repo.getRef('heads/' + name, function (err, sha) {
        if (sha) {
          resolve({ name: name, sha: sha });
        } else {
          reject(err);
        }
      });
    });
  });
};

var getBranchesForRepo = exports.getBranchesForRepo = function getBranchesForRepo(username, reponame) {
  var repo = github.getRepo(username, reponame);
  return new Promise(function (resolve, reject) {
    repo.listBranches(function (err, branches) {
      if (branches) {
        resolve(Promise.all(getBranchesLastCommits(repo, branches)));
      } else {
        reject(err);
      }
    });
  });
};

var getRepoForUser = exports.getRepoForUser = function getRepoForUser(username, reponame) {
  var repo = github.getRepo(username, reponame);
  return new Promise(function (resolve, reject) {
    repo.show(function (err, repo) {
      if (repo) {
        resolve(repo);
      } else {
        reject(err);
      }
    });
  });
};

var getIssuesForRepo = exports.getIssuesForRepo = function getIssuesForRepo(username, reponame) {
  var issues = github.getIssues(username, reponame);
  return new Promise(function (resolve, reject) {
    issues.list({}, function (err, issues) {
      if (issues) {
        resolve(issues);
      } else {
        reject(err);
      }
    });
  });
};

var getCommentsForIssue = exports.getCommentsForIssue = function getCommentsForIssue(username, reponame, issue) {
  var issues = github.getIssues(username, reponame);
  return new Promise(function (resolve, reject) {
    issues.getComments(issue, function (err, comments) {
      if (comments) {
        resolve(comments);
      } else {
        reject(err);
      }
    });
  });
};

var getTreeForRepo = exports.getTreeForRepo = function getTreeForRepo(username, reponame, tree) {
  return new Promise(function (resolve, reject) {
    github.getRepo(username, reponame).getTree(tree, function (err, result) {
      if (result) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};

var getStatusesForRepo = exports.getStatusesForRepo = function getStatusesForRepo(username, reponame, sha) {
  return new Promise(function (resolve, reject) {
    github.getRepo(username, reponame).getStatuses(sha, function (err, result) {
      if (result) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};