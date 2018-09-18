'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _github = require('./apis/github');

var _graphql = require('graphql');

var _lodash = require('lodash');

var CommitAuthorType = new _graphql.GraphQLObjectType({
  name: 'GithubCommitAuthor',
  description: 'Commit author that is not associated with a Github acount',
  fields: {
    email: { type: _graphql.GraphQLString },
    name: { type: _graphql.GraphQLString }
  }
});

var StatusType = new _graphql.GraphQLObjectType({
  name: 'GithubStatus',
  description: 'Status of a commit',
  fields: {
    state: { type: _graphql.GraphQLString },
    description: { type: _graphql.GraphQLString },
    target_url: { type: _graphql.GraphQLString },
    context: { type: _graphql.GraphQLString },
    updated_at: { type: _graphql.GraphQLString }
  }
});

var UserType = new _graphql.GraphQLObjectType({
  name: 'GithubUser',
  fields: function fields() {
    return {
      login: { type: _graphql.GraphQLString },
      id: { type: _graphql.GraphQLInt },
      company: { type: _graphql.GraphQLString },
      avatar_url: { type: _graphql.GraphQLString },
      repos: {
        type: new _graphql.GraphQLList(RepoType),
        resolve: function resolve(user) {
          return (0, _github.getReposForUser)(user.login);
        }
      }
    };
  }
});

var UserOrCommitAuthorType = new _graphql.GraphQLUnionType({
  name: 'UserOrCommitAuthor',
  resolveType: function resolveType(author) {
    if ((0, _lodash.isObject)(author) && author.login) {
      return UserType;
    }
    return CommitAuthorType;
  },
  types: [CommitAuthorType, UserType]
});

var TreeEntryType = new _graphql.GraphQLObjectType({
  name: 'GithubTreeEntry',
  fields: function fields() {
    return {
      path: {
        type: _graphql.GraphQLString
      },
      last_commit: {
        type: CommitType,
        resolve: function resolve(data) {
          var path = data.path;

          var _grabUsernameAndRepon = grabUsernameAndReponameFromURL(data.url),
              username = _grabUsernameAndRepon.username,
              reponame = _grabUsernameAndRepon.reponame;

          return (0, _github.getCommitsForRepo)(username, reponame, { path: path, limit: 1 }).then(function (list) {
            return list[0];
          }); // just the commit object
        }
      }
    };
  }
});

var TreeType = new _graphql.GraphQLObjectType({
  name: 'GithubTree',
  fields: function fields() {
    return {
      entries: {
        type: new _graphql.GraphQLList(TreeEntryType),
        resolve: function resolve(data) {
          return data;
        }
      }
    };
  }
});

var CommitType = new _graphql.GraphQLObjectType({
  name: 'GithubCommit',
  fields: function fields() {
    return {
      sha: { type: _graphql.GraphQLString },
      author: {
        type: UserOrCommitAuthorType,
        resolve: function resolve(obj) {
          return obj.author || obj.commit && obj.commit.author;
        }
      },
      message: {
        type: _graphql.GraphQLString,
        resolve: function resolve(commit) {
          return commit.commit && commit.commit.message;
        }
      },
      date: {
        type: _graphql.GraphQLString,
        resolve: function resolve(commit) {
          return commit.commit && commit.commit.committer.date;
        }
      },
      status: {
        type: new _graphql.GraphQLList(StatusType),
        resolve: function resolve(commit) {
          var _grabUsernameAndRepon2 = grabUsernameAndReponameFromURL(commit.url),
              username = _grabUsernameAndRepon2.username,
              reponame = _grabUsernameAndRepon2.reponame;

          var sha = commit.sha;

          return (0, _github.getStatusesForRepo)(username, reponame, sha);
        }
      },
      tree: {
        type: TreeType,
        resolve: function resolve(commit) {
          if (!commit.commit) return null;

          var tree = commit.commit.tree;

          var _grabUsernameAndRepon3 = grabUsernameAndReponameFromURL(tree.url),
              username = _grabUsernameAndRepon3.username,
              reponame = _grabUsernameAndRepon3.reponame;

          return commit.commit && (0, _github.getTreeForRepo)(username, reponame, tree.sha);
        }
      }
    };
  }
});

var IssueCommentType = new _graphql.GraphQLObjectType({
  name: 'GithubIssueCommentType',
  fields: {
    id: { type: _graphql.GraphQLInt },
    body: { type: _graphql.GraphQLString },
    user: {
      type: UserType,
      resolve: function resolve(issueComment) {
        return issueComment.user;
      }
    }
  }
});

var IssueLabelType = new _graphql.GraphQLObjectType({
  name: 'GithubIssueLabelType',
  fields: {
    url: { type: _graphql.GraphQLString },
    name: { type: _graphql.GraphQLString },
    color: { type: _graphql.GraphQLString }
  }
});

var grabUsernameAndReponameFromURL = function grabUsernameAndReponameFromURL(url) {
  var array = url.split('https://api.github.com/repos/')[1].split('/');
  return {
    username: array[0],
    reponame: array[1]
  };
};

var IssueType = new _graphql.GraphQLObjectType({
  name: 'GithubIssue',
  fields: {
    id: { type: _graphql.GraphQLInt },
    state: { type: _graphql.GraphQLString },
    title: { type: _graphql.GraphQLString },
    body: { type: _graphql.GraphQLString },
    user: { type: UserType },
    assignee: { type: UserType },
    closed_by: { type: UserType },
    labels: { type: new _graphql.GraphQLList(IssueLabelType) },
    commentCount: {
      type: _graphql.GraphQLInt,
      resolve: function resolve(issue) {
        return issue.comments;
      }
    },
    comments: {
      type: new _graphql.GraphQLList(IssueCommentType),
      resolve: function resolve(issue) {
        var _grabUsernameAndRepon4 = grabUsernameAndReponameFromURL(issue.url),
            username = _grabUsernameAndRepon4.username,
            reponame = _grabUsernameAndRepon4.reponame;

        return (0, _github.getCommentsForIssue)(username, reponame, issue);
      }
    }
  }
});

var BranchType = new _graphql.GraphQLObjectType({
  name: 'GithubBranch',
  fields: {
    name: { type: _graphql.GraphQLString },
    lastCommit: {
      type: CommitType,
      resolve: function resolve(branch) {
        var ownerUsername = branch.ownerUsername,
            reponame = branch.reponame; // info has been added while loading

        return (0, _github.getCommitsForRepo)(ownerUsername, reponame, { sha: branch.sha }).then(function (list) {
          return list[0];
        }); // just the commit object
      }
    }
  }
});

var RepoType = new _graphql.GraphQLObjectType({
  name: 'GithubRepo',
  fields: {
    id: { type: _graphql.GraphQLInt },
    name: { type: _graphql.GraphQLString },
    commits: {
      type: new _graphql.GraphQLList(CommitType),
      args: {
        limit: {
          type: _graphql.GraphQLInt
        }
      },
      resolve: function resolve(repo, args) {
        return (0, _github.getCommitsForRepo)(repo.owner.login, repo.name, args);
      }
    },
    issues: {
      type: new _graphql.GraphQLList(IssueType),
      args: {
        limit: { type: _graphql.GraphQLInt }
      },
      resolve: function resolve(repo, _ref) {
        var limit = _ref.limit;

        return (0, _github.getIssuesForRepo)(repo.owner.login, repo.name).then(function (issues) {
          if (limit) {
            return issues.slice(0, limit);
          }
          return issues;
        });
      }
    },
    branches: {
      type: new _graphql.GraphQLList(BranchType),
      args: {
        limit: { type: _graphql.GraphQLInt }
      },
      resolve: function resolve(repo, _ref2) {
        var limit = _ref2.limit;

        var ownerUsername = repo.owner.login;
        var reponame = repo.name;
        return (0, _github.getBranchesForRepo)(ownerUsername, reponame).then(function (branches) {
          // add repo referenceData
          return branches.map(function (b) {
            return _extends({ reponame: reponame, ownerUsername: ownerUsername }, b);
          });
        }).then(function (branches) {
          if (limit) {
            // Later: optimise query...
            return branches.slice(0, limit);
          }
          return branches;
        });
      }
    },
    owner: {
      type: UserType
    }
  }
});

var githubType = new _graphql.GraphQLObjectType({
  name: 'GithubAPI',
  description: 'The Github API',
  fields: {
    user: {
      type: UserType,
      args: {
        username: {
          description: 'Username of the user',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref3) {
        var username = _ref3.username;

        return (0, _github.getUser)(username);
      }
    },
    repo: {
      type: RepoType,
      args: {
        name: {
          description: 'Name of the repo',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        },
        ownerUsername: {
          description: 'Username of the owner',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref4) {
        var ownerUsername = _ref4.ownerUsername,
            name = _ref4.name;

        return (0, _github.getRepoForUser)(ownerUsername, name);
      }
    }
  }
});

var QueryObjectType = exports.QueryObjectType = githubType;