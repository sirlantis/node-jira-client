'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @name JiraApi
 * @class
 * Wrapper for the JIRA Rest Api
 * https://docs.atlassian.com/jira/REST/6.4.8/
 */
var JiraApi = function () {
  /**
   * @constructor
   * @function
   * @param {JiraApiOptions} options
   */
  function JiraApi(options) {
    (0, _classCallCheck3.default)(this, JiraApi);

    this.protocol = options.protocol || 'http';
    this.host = options.host;
    this.port = options.port || null;
    this.apiVersion = options.apiVersion || '2';
    this.base = options.base || '';
    this.strictSSL = options.hasOwnProperty('strictSSL') ? options.strictSSL : true;
    // This is so we can fake during unit tests
    this.request = options.request || _requestPromise2.default;
    this.webhookVersion = options.webHookVersion || '1.0';
    this.greenhopperVersion = options.greenhopperVersion || '1.0';
    this.agileVersion = options.agileVersion || '1.0';
    this.baseOptions = {};

    if (options.oauth && options.oauth.consumer_key && options.oauth.access_token) {
      this.baseOptions.oauth = {
        consumer_key: options.oauth.consumer_key,
        consumer_secret: options.oauth.consumer_secret,
        token: options.oauth.access_token,
        token_secret: options.oauth.access_token_secret,
        signature_method: options.oauth.signature_method || 'RSA-SHA1'
      };
    } else if (options.username && options.password) {
      this.baseOptions.auth = {
        user: options.username,
        pass: options.password
      };
    }

    if (options.timeout) {
      this.baseOptions.timeout = options.timeout;
    }
  }

  /**
   * @typedef JiraApiOptions
   * @type {object}
   * @property {string} [protocol=http] - What protocol to use to connect to
   * jira? Ex: http|https
   * @property {string} host - What host is this tool connecting to for the jira
   * instance? Ex: jira.somehost.com
   * @property {string} [port] - What port is this tool connecting to jira with? Only needed for
   * none standard ports. Ex: 8080, 3000, etc
   * @property {string} [username] - Specify a username for this tool to authenticate all
   * requests with.
   * @property {string} [password] - Specify a password for this tool to authenticate all
   * requests with.
   * @property {string} [apiVersion=2] - What version of the jira rest api is the instance the
   * tool is connecting to?
   * @property {string} [base] - What other url parts exist, if any, before the rest/api/
   * section?
   * @property {boolean} [strictSSL=true] - Does this tool require each request to be
   * authenticated?  Defaults to true.
   * @property {function} [request] - What method does this tool use to make its requests?
   * Defaults to request from request-promise
   * @property {number} [timeout] - Integer containing the number of milliseconds to wait for a
   * server to send response headers (and start the response body) before aborting the request. Note
   * that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout
   * will overrule the timeout option ([the default in Linux can be anywhere from 20-120 *
   * seconds](http://www.sekuda.com/overriding_the_default_linux_kernel_20_second_tcp_socket_connect_timeout)).
   * @property {string} [webhookVersion=1.0] - What webhook version does this api wrapper need to
   * hit?
   * @property {string} [greenhopperVersion=1.0] - What webhook version does this api wrapper need
   * to hit?
   * @property {OAuth} - Specify an oauth object for this tool to authenticate all requests using
   * OAuth.
   */

  /**
   * @typedef OAuth
   * @type {object}
   * @property {string} consumer_key - The consumer entered in Jira Preferences.
   * @property {string} consumer_secret - The private RSA file.
   * @property {string} access_token - The generated access token.
   * @property {string} access_token_secret - The generated access toke secret.
   * @property {string} signature_method [signature_method=RSA-SHA1] - OAuth signurate methode
   * Possible values RSA-SHA1, HMAC-SHA1, PLAINTEXT. Jira Cloud supports only RSA-SHA1.
   */

  /**
   * @name makeRequestHeader
   * @function
   * Creates a requestOptions object based on the default template for one
   * @param {string} uri
   * @param {object} [options] - an object containing fields and formatting how the
   */


  (0, _createClass3.default)(JiraApi, [{
    key: 'makeRequestHeader',
    value: function makeRequestHeader(uri) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return (0, _extends3.default)({
        rejectUnauthorized: this.strictSSL,
        method: options.method || 'GET',
        uri: uri,
        json: true
      }, options);
    }

    /**
     * @typedef makeRequestHeaderOptions
     * @type {object}
     * @property {string} [method] - HTTP Request Method. ie GET, POST, PUT, DELETE
     */

    /**
     * @name makeUri
     * @function
     * Creates a URI object for a given pathname
     * @param {string} pathname - The url after the /rest/api/version
     */

  }, {
    key: 'makeUri',
    value: function makeUri(_ref) {
      var pathname = _ref.pathname;
      var query = _ref.query;

      var uri = _url2.default.format({
        protocol: this.protocol,
        hostname: this.host,
        port: this.port,
        pathname: this.base + '/rest/api/' + this.apiVersion + pathname,
        query: query
      });
      return decodeURIComponent(uri);
    }

    /**
     * @name makeWebhookUri
     * @function
     * Creates a URI object for a given pathName
     * @param {string} pathname - The url after the /rest/
     */

  }, {
    key: 'makeWebhookUri',
    value: function makeWebhookUri(_ref2) {
      var pathname = _ref2.pathname;

      var uri = _url2.default.format({
        protocol: this.protocol,
        hostname: this.host,
        port: this.port,
        pathname: this.base + '/rest/webhooks/' + this.webhookVersion + pathname
      });
      return decodeURIComponent(uri);
    }

    /**
     * @name makeSprintQueryUri
     * @function
     * Creates a URI object for a given pathName
     * @param {string} pathname - The url after the /rest/
     */

  }, {
    key: 'makeSprintQueryUri',
    value: function makeSprintQueryUri(_ref3) {
      var pathname = _ref3.pathname;
      var query = _ref3.query;

      var uri = _url2.default.format({
        protocol: this.protocol,
        hostname: this.host,
        port: this.port,
        pathname: this.base + '/rest/greenhopper/' + this.greenhopperVersion + pathname,
        query: query
      });
      return decodeURIComponent(uri);
    }

    /**
     * @name makeAgileUri
     * @function
     * Creates a URI object for a given pathName
     * @param {string} pathname - The url after the /rest/
     */

  }, {
    key: 'makeAgileUri',
    value: function makeAgileUri(_ref4) {
      var pathname = _ref4.pathname;
      var query = _ref4.query;

      var uri = _url2.default.format({
        protocol: this.protocol,
        hostname: this.host,
        port: this.port,
        pathname: this.base + '/rest/agile/' + this.agileVersion + pathname,
        query: query
      });
      return decodeURIComponent(uri);
    }

    /**
     * @name doRequest
     * @function
     * Does a request based on the requestOptions object
     * @param {object} requestOptions - fields on this object get posted as a request header for
     * requests to jira
     */

  }, {
    key: 'doRequest',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(requestOptions) {
        var options, response;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = (0, _extends3.default)({}, this.baseOptions, requestOptions);
                _context.next = 3;
                return this.request(options);

              case 3:
                response = _context.sent;

                if (!response) {
                  _context.next = 7;
                  break;
                }

                if (!(Array.isArray(response.errorMessages) && response.errorMessages.length > 0)) {
                  _context.next = 7;
                  break;
                }

                throw new Error(response.errorMessages.join(', '));

              case 7:
                return _context.abrupt('return', response);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function doRequest(_x2) {
        return _ref5.apply(this, arguments);
      }

      return doRequest;
    }()

    /**
     * @name findIssue
     * @function
     * Find an issue in jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290709)
     * @param {string} issueNumber - The issue number to search for including the project key
     */

  }, {
    key: 'findIssue',
    value: function findIssue(issueNumber) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueNumber
      })));
    }

    /**
     * @name getUnresolvedIssueCount
     * @function
     * Get the unresolved issue count
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288524)
     * @param {string} version - the version of your product you want to find the unresolved
     * issues of.
     */

  }, {
    key: 'getUnresolvedIssueCount',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(version) {
        var requestHeaders, response;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                requestHeaders = this.makeRequestHeader(this.makeUri({
                  pathname: '/version/' + version + '/unresolvedIssueCount'
                }));
                _context2.next = 3;
                return this.doRequest(requestHeaders);

              case 3:
                response = _context2.sent;
                return _context2.abrupt('return', response.issuesUnresolvedCount);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getUnresolvedIssueCount(_x3) {
        return _ref6.apply(this, arguments);
      }

      return getUnresolvedIssueCount;
    }()

    /**
     * @name getProject
     * @function
     * Get the Project by project key
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289232)
     * @param {string} project - key for the project
     */

  }, {
    key: 'getProject',
    value: function getProject(project) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/project/' + project
      })));
    }

    /**
       * @name createProject
       * @function
       * Create a new Project
       * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/project-createProject)
       * @param {object} project - with specs
       */

  }, {
    key: 'createProject',
    value: function createProject(project) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/project/'
      }), {
        method: 'POST',
        body: project
      }));
    }

    /** Find the Rapid View for a specified project
     * @name findRapidView
     * @function
     * @param {string} projectName - name for the project
     */

  }, {
    key: 'findRapidView',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(projectName) {
        var response, rapidViewResult;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
                  pathname: '/rapidviews/list'
                })));

              case 2:
                response = _context3.sent;
                rapidViewResult = response.views.filter(function (x) {
                  return x.name.toLowerCase() === projectName.toLowerCase();
                });
                return _context3.abrupt('return', rapidViewResult[0]);

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function findRapidView(_x4) {
        return _ref7.apply(this, arguments);
      }

      return findRapidView;
    }()

    /** Get a list of Sprints belonging to a Rapid View
     * @name getLastSprintForRapidView
     * @function
     * @param {string} rapidViewId - the id for the rapid view
     */

  }, {
    key: 'getLastSprintForRapidView',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(rapidViewId) {
        var response;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
                  pathname: '/sprintquery/' + rapidViewId
                })));

              case 2:
                response = _context4.sent;
                return _context4.abrupt('return', response.sprints.pop());

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getLastSprintForRapidView(_x5) {
        return _ref8.apply(this, arguments);
      }

      return getLastSprintForRapidView;
    }()

    /** Get the issues for a rapidView / sprint
     * @name getSprintIssues
     * @function
     * @param {string} rapidViewId - the id for the rapid view
     * @param {string} sprintId - the id for the sprint
     */

  }, {
    key: 'getSprintIssues',
    value: function getSprintIssues(rapidViewId, sprintId) {
      return this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
        pathname: '/rapid/charts/sprintreport',
        query: {
          rapidViewId: rapidViewId,
          sprintId: sprintId
        }
      })));
    }

    /** Add an issue to the project's current sprint
     * @name addIssueToSprint
     * @function
     * @param {string} issueId - the id of the existing issue
     * @param {string} sprintId - the id of the sprint to add it to
     */

  }, {
    key: 'addIssueToSprint',
    value: function addIssueToSprint(issueId, sprintId) {
      return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
        pathname: '/sprint/' + sprintId + '/issue'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: {
          issues: [issueId]
        }
      }));
    }

    /** Create an issue link between two issues
     * @name issueLink
     * @function
     * @param {object} link - a link object formatted how the Jira API specifies
     */

  }, {
    key: 'issueLink',
    value: function issueLink(link) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issueLink'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: link
      }));
    }

    /** Retrieves the remote links associated with the given issue.
     * @name getRemoteLinks
     * @function
     * @param {string} issueNumber - the issue number to find remote links for.
     */

  }, {
    key: 'getRemoteLinks',
    value: function getRemoteLinks(issueNumber) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueNumber + '/remotelink'
      })));
    }

    /**
     * @name createRemoteLink
     * @function
     * Creates a remote link associated with the given issue.
     * @param {string} issueNumber - The issue number to create the remotelink under
     * @param {object} remoteLink - the remotelink object as specified by the Jira API
     */

  }, {
    key: 'createRemoteLink',
    value: function createRemoteLink(issueNumber, remoteLink) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueNumber + '/remotelink'
      }), {
        method: 'POST',
        body: remoteLink
      }));
    }

    /** Get Versions for a project
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289653)
     * @name getVersions
     * @function
     * @param {string} project - A project key to get versions for
     */

  }, {
    key: 'getVersions',
    value: function getVersions(project) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/project/' + project + '/versions'
      })));
    }

    /** Create a version
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288232)
     * @name createVersion
     * @function
     * @param {string} version - an object of the new version
     */

  }, {
    key: 'createVersion',
    value: function createVersion(version) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/version'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: version
      }));
    }

    /** Update a version
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e510)
     * @name updateVersion
     * @function
     * @param {string} version - an new object of the version to update
     */

  }, {
    key: 'updateVersion',
    value: function updateVersion(version) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/version/' + version.id
      }), {
        method: 'PUT',
        followAllRedirects: true,
        body: version
      }));
    }

    /** Delete a version
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/version-delete)
     * @name deleteVersion
     * @function
     * @param {string} versionId - the ID of the version to delete
     * @param {string} moveFixIssuesToId - when provided, existing fixVersions will be moved
     *                 to this ID. Otherwise, the deleted version will be removed from all
     *                 issue fixVersions.
     * @param {string} moveAffectedIssuesToId - when provided, existing affectedVersions will
     *                 be moved to this ID. Otherwise, the deleted version will be removed
     *                 from all issue affectedVersions.
     */

  }, {
    key: 'deleteVersion',
    value: function deleteVersion(versionId, moveFixIssuesToId, moveAffectedIssuesToId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/version/' + versionId
      }), {
        method: 'DELETE',
        followAllRedirects: true,
        qs: {
          moveFixIssuesTo: moveFixIssuesToId,
          moveAffectedIssuesTo: moveAffectedIssuesToId
        }
      }));
    }

    /** Pass a search query to Jira
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e4424)
     * @name searchJira
     * @function
     * @param {string} searchString - jira query string in JQL
     * @param {object} optional - object containing any of the following properties
     * @param {integer} [optional.startAt=0]: optional starting index number
     * @param {integer} [optional.maxResults=50]: optional ending index number
     * @param {array} [optional.fields]: optional array of string names of desired fields
     */

  }, {
    key: 'searchJira',
    value: function searchJira(searchString) {
      var optional = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/search'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: (0, _extends3.default)({
          jql: searchString
        }, optional)
      }));
    }

    /** Search user on Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#d2e3756)
     * @name searchUsers
     * @function
     * @param {SearchUserOptions} options
     */

  }, {
    key: 'searchUsers',
    value: function searchUsers(_ref9) {
      var username = _ref9.username;
      var startAt = _ref9.startAt;
      var maxResults = _ref9.maxResults;
      var includeActive = _ref9.includeActive;
      var includeInactive = _ref9.includeInactive;

      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/user/search',
        query: {
          username: username,
          startAt: startAt || 0,
          maxResults: maxResults || 50,
          includeActive: includeActive || true,
          includeInactive: includeInactive || false
        }
      }), {
        followAllRedirects: true
      }));
    }

    /**
     * @typedef SearchUserOptions
     * @type {object}
     * @property {string} username - A query string used to search username, name or e-mail address
     * @property {integer} [startAt=0] - The index of the first user to return (0-based)
     * @property {integer} [maxResults=50] - The maximum number of users to return
     * @property {boolean} [includeActive=true] - If true, then active users are included
     * in the results
     * @property {boolean} [includeInactive=false] - If true, then inactive users
     * are included in the results
     */

    /** Get all users in group on Jira
     * @name getUsersInGroup
     * @function
     * @param {string} groupname - A query string used to search users in group
     * @param {integer} [startAt=0] - The index of the first user to return (0-based)
     * @param {integer} [maxResults=50] - The maximum number of users to return (defaults to 50).
     */

  }, {
    key: 'getUsersInGroup',
    value: function getUsersInGroup(groupname) {
      var startAt = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var maxResults = arguments.length <= 2 || arguments[2] === undefined ? 50 : arguments[2];

      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/group',
        query: {
          groupname: groupname,
          expand: 'users[' + startAt + ':' + maxResults + ']'
        }
      }), {
        followAllRedirects: true
      }));
    }

    /** Get issues related to a user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id296043)
     * @name getUsersIssues
     * @function
     * @param {string} username - username of user to search for
     * @param {boolean} open - determines if only open issues should be returned
     */

  }, {
    key: 'getUsersIssues',
    value: function getUsersIssues(username, open) {
      return this.searchJira('assignee = ' + username.replace('@', '\\u0040') + ' ' + ('AND status in (Open, \'In Progress\', Reopened) ' + open), {});
    }

    /** Add issue to Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
     * @name addNewIssue
     * @function
     * @param {object} issue - Properly Formatted Issue object
     */

  }, {
    key: 'addNewIssue',
    value: function addNewIssue(issue) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: issue
      }));
    }

    /** Add a user as a watcher on an issue
     * @name addWatcher
     * @function
     * @param {string} issueKey - the key of the existing issue
     * @param {string} username - the jira username to add as a watcher to the issue
     */

  }, {
    key: 'addWatcher',
    value: function addWatcher(issueKey, username) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueKey + '/watchers'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: (0, _stringify2.default)(username)
      }));
    }

    /** Delete issue from Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290791)
     * @name deleteIssue
     * @function
     * @param {string} issueId - the Id of the issue to delete
     */

  }, {
    key: 'deleteIssue',
    value: function deleteIssue(issueId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId
      }), {
        method: 'DELETE',
        followAllRedirects: true
      }));
    }

    /** Update issue in Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290878)
     * @name updateIssue
     * @function
     * @param {string} issueId - the Id of the issue to delete
     * @param {object} issueUpdate - update Object as specified by the rest api
     */

  }, {
    key: 'updateIssue',
    value: function updateIssue(issueId, issueUpdate) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId
      }), {
        body: issueUpdate,
        method: 'PUT',
        followAllRedirects: true
      }));
    }

    /** List Components
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listComponents
     * @function
     * @param {string} project - key for the project
     */

  }, {
    key: 'listComponents',
    value: function listComponents(project) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/project/' + project + '/components'
      })));
    }

    /** Add component to Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
     * @name addNewComponent
     * @function
     * @param {object} component - Properly Formatted Component
     */

  }, {
    key: 'addNewComponent',
    value: function addNewComponent(component) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/component'
      }), {
        method: 'POST',
        followAllRedirects: true,
        body: component
      }));
    }

    /** Delete component from Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290791)
     * @name deleteComponent
     * @function
     * @param {string} componentId - the Id of the component to delete
     */

  }, {
    key: 'deleteComponent',
    value: function deleteComponent(componentId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/component/' + componentId
      }), {
        method: 'DELETE',
        followAllRedirects: true
      }));
    }

    /** List all fields custom and not that jira knows about.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listFields
     * @function
     */

  }, {
    key: 'listFields',
    value: function listFields() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/field'
      })));
    }

    /** List all priorities jira knows about
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listPriorities
     * @function
     */

  }, {
    key: 'listPriorities',
    value: function listPriorities() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/priority'
      })));
    }

    /** List Transitions for a specific issue that are available to the current user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listTransitions
     * @function
     * @param {string} issueId - get transitions available for the issue
     */

  }, {
    key: 'listTransitions',
    value: function listTransitions(issueId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/transitions',
        query: {
          expand: 'transitions.fields'
        }
      })));
    }

    /** Transition issue in Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name transitionsIssue
     * @function
     * @param {string} issueId - the Id of the issue to delete
     * @param {object} issueTransition - transition object from the jira rest API
     */

  }, {
    key: 'transitionIssue',
    value: function transitionIssue(issueId, issueTransition) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/transitions'
      }), {
        body: issueTransition,
        method: 'POST',
        followAllRedirects: true
      }));
    }

    /** List all Viewable Projects
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289193)
     * @name listProjects
     * @function
     */

  }, {
    key: 'listProjects',
    value: function listProjects() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/project'
      })));
    }

    /** Add a comment to an issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#id108798)
     * @name addComment
     * @function
     * @param {string} issueId - Issue to add a comment to
     * @param {string} comment - string containing comment
     */

  }, {
    key: 'addComment',
    value: function addComment(issueId, comment) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/comment'
      }), {
        body: {
          body: comment
        },
        method: 'POST',
        followAllRedirects: true
      }));
    }

    /** Add a worklog to a project
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id291617)
     * @name addWorklog
     * @function
     * @param {string} issueId - Issue to add a worklog to
     * @param {object} worklog - worklog object from the rest API
     * @param {object} newEstimate - the new value for the remaining estimate field
     */

  }, {
    key: 'addWorklog',
    value: function addWorklog(issueId, worklog, newEstimate) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/worklog',
        query: newEstimate ? { adjustEstimate: 'new', newEstimate: newEstimate } : null
      }), {
        body: worklog,
        method: 'POST',
        followAllRedirects: true
      }));
    }

    /** Delete worklog from issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e1673)
     * @name deleteWorklog
     * @function
     * @param {string} issueId - the Id of the issue to delete
     * @param {string} worklogId - the Id of the worklog in issue to delete
     */

  }, {
    key: 'deleteWorklog',
    value: function deleteWorklog(issueId, worklogId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/worklog/' + worklogId
      }), {
        method: 'DELETE',
        followAllRedirects: true
      }));
    }

    /** List all Issue Types jira knows about
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id295946)
     * @name listIssueTypes
     * @function
     */

  }, {
    key: 'listIssueTypes',
    value: function listIssueTypes() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issuetype'
      })));
    }

    /** Register a webhook
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name registerWebhook
     * @function
     * @param {object} webhook - properly formatted webhook
     */

  }, {
    key: 'registerWebhook',
    value: function registerWebhook(webhook) {
      return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
        pathname: '/webhook'
      }), {
        method: 'POST',
        body: webhook
      }));
    }

    /** List all registered webhooks
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name listWebhooks
     * @function
     */

  }, {
    key: 'listWebhooks',
    value: function listWebhooks() {
      return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
        pathname: '/webhook'
      })));
    }

    /** Get a webhook by its ID
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name getWebhook
     * @function
     * @param {string} webhookID - id of webhook to get
     */

  }, {
    key: 'getWebhook',
    value: function getWebhook(webhookID) {
      return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
        pathname: '/webhook/' + webhookID
      })));
    }

    /** Delete a registered webhook
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name issueLink
     * @function
     * @param {string} webhookID - id of the webhook to delete
     */

  }, {
    key: 'deleteWebhook',
    value: function deleteWebhook(webhookID) {
      return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
        pathname: '/webhook/' + webhookID
      }), {
        method: 'DELETE'
      }));
    }

    /** Describe the currently authenticated user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id2e865)
     * @name getCurrentUser
     * @function
     */

  }, {
    key: 'getCurrentUser',
    value: function getCurrentUser() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/myself'
      })));
    }

    /** Retrieve the backlog of a certain Rapid View
     * @name getBacklogForRapidView
     * @function
     * @param {string} rapidViewId - rapid view id
     */

  }, {
    key: 'getBacklogForRapidView',
    value: function getBacklogForRapidView(rapidViewId) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/xboard/plan/backlog/data',
        query: {
          rapidViewId: rapidViewId
        }
      })));
    }

    /** Add attachment to a Issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/issue/{issueIdOrKey}/attachments-addAttachment)
     * @name addAttachmentOnIssue
     * @function
     * @param {string} issueId - issue id
     * @param {object} readStream - readStream object from fs
     */

  }, {
    key: 'addAttachmentOnIssue',
    value: function addAttachmentOnIssue(issueId, readStream) {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/issue/' + issueId + '/attachments'
      }), {
        method: 'POST',
        headers: {
          'X-Atlassian-Token': 'nocheck'
        },
        formData: {
          file: readStream
        }
      }));
    }

    /** Get list of possible statuses
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/status-getStatuses)
     * @name listStatus
     * @function
     */

  }, {
    key: 'listStatus',
    value: function listStatus() {
      return this.doRequest(this.makeRequestHeader(this.makeUri({
        pathname: '/status'
      })));
    }
  }]);
  return JiraApi;
}();

exports.default = JiraApi;
module.exports = exports['default'];