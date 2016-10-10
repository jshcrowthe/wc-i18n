(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fetchMock = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var fetchMock = require('./fetch-mock');
var statusTextMap = require('./status-text');
var theGlobal = typeof window !== 'undefined' ? window : self;

module.exports = fetchMock({
	global: theGlobal,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
	statusTextMap: statusTextMap
});
},{"./fetch-mock":3,"./status-text":4}],2:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function getHeaderMatcher(expectedHeaders) {
	var expectation = Object.keys(expectedHeaders).map(function (k) {
		return { key: k.toLowerCase(), val: expectedHeaders[k] };
	});
	return function (headers) {
		if (!headers) {
			headers = {};
		}
		var lowerCaseHeaders = Object.keys(headers).reduce(function (obj, k) {
			obj[k.toLowerCase()] = headers[k];
			return obj;
		}, {});
		return expectation.every(function (header) {
			return lowerCaseHeaders[header.key] === header.val;
		});
	};
}

function normalizeRequest(url, options, Request) {
	if (Request.prototype.isPrototypeOf(url)) {
		return {
			url: url.url,
			method: url.method,
			headers: function () {
				var headers = {};
				url.headers.forEach(function (name) {
					return headers[name] = url.headers.name;
				});
				return headers;
			}()
		};
	} else {
		return {
			url: url,
			method: options && options.method || 'GET',
			headers: options && options.headers
		};
	}
}

module.exports = function (route, Request) {
	route = _extends({}, route);

	if (typeof route.response === 'undefined') {
		throw new Error('Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error('each route must specify a string, regex or function to match calls to fetch');
	}

	if (!route.name) {
		route.name = route.matcher.toString();
		route.__unnamed = true;
	}

	// If user has provided a function as a matcher we assume they are handling all the
	// matching logic they need
	if (typeof route.matcher === 'function') {
		return route;
	}

	var expectedMethod = route.method && route.method.toLowerCase();

	function matchMethod(method) {
		return !expectedMethod || expectedMethod === (method ? method.toLowerCase() : 'get');
	};

	var matchHeaders = route.headers ? getHeaderMatcher(route.headers) : function () {
		return true;
	};

	var matchUrl = void 0;

	if (typeof route.matcher === 'string') {

		if (route.matcher === '*') {
			matchUrl = function matchUrl() {
				return true;
			};
		} else if (route.matcher.indexOf('^') === 0) {
			(function () {
				var expectedUrl = route.matcher.substr(1);
				matchUrl = function matchUrl(url) {
					return url.indexOf(expectedUrl) === 0;
				};
			})();
		} else {
			(function () {
				var expectedUrl = route.matcher;
				matchUrl = function matchUrl(url) {
					return url === expectedUrl;
				};
			})();
		}
	} else if (route.matcher instanceof RegExp) {
		(function () {
			var urlRX = route.matcher;
			matchUrl = function matchUrl(url) {
				return urlRX.test(url);
			};
		})();
	}

	var matcher = function matcher(url, options) {
		var req = normalizeRequest(url, options, Request);
		return matchHeaders(req.headers) && matchMethod(req.method) && matchUrl(req.url);
	};

	if (route.times) {
		(function () {
			var timesLeft = route.times;
			route.matcher = function (url, options) {
				var match = timesLeft && matcher(url, options);
				if (match) {
					timesLeft--;
					return true;
				}
			};
			route.reset = function () {
				return timesLeft = route.times;
			};
		})();
	} else {
		route.matcher = matcher;
	}

	return route;
};
},{}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compileRoute = require('./compile-route');

var FetchMock = function () {
	function FetchMock(opts) {
		_classCallCheck(this, FetchMock);

		this.config = {
			sendAsJson: true
		};
		this.Headers = opts.Headers;
		this.Request = opts.Request;
		this.Response = opts.Response;
		this.stream = opts.stream;
		this.global = opts.global;
		this.statusTextMap = opts.statusTextMap;
		this.routes = [];
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
		this.fetchMock = this.fetchMock.bind(this);
		this.restore = this.restore.bind(this);
		this.reset = this.reset.bind(this);
	}

	_createClass(FetchMock, [{
		key: 'mock',
		value: function mock(matcher, response, options) {

			var route = void 0;

			// Handle the variety of parameters accepted by mock (see README)

			// Old method matching signature
			if (options && /^[A-Z]+$/.test(response)) {
				throw new Error('The API for method matching has changed.\n\t\t\t\tNow use .get(), .post(), .put(), .delete() and .head() shorthand methods,\n\t\t\t\tor pass in, e.g. {method: \'PATCH\'} as a third paramter');
			} else if (options) {
				route = _extends({
					matcher: matcher,
					response: response
				}, options);
			} else if (matcher && response) {
				route = {
					matcher: matcher,
					response: response
				};
			} else if (matcher && matcher.matcher) {
				route = matcher;
			} else {
				throw new Error('Invalid parameters passed to fetch-mock');
			}

			this.addRoute(route);

			return this._mock();
		}
	}, {
		key: 'once',
		value: function once(matcher, response, options) {
			return this.mock(matcher, response, _extends({}, options, { times: 1 }));
		}
	}, {
		key: '_mock',
		value: function _mock() {
			// Do this here rather than in the constructor to ensure it's scoped to the test
			this.realFetch = this.realFetch || this.global.fetch;
			this.global.fetch = this.fetchMock;
			return this;
		}
	}, {
		key: '_unMock',
		value: function _unMock() {
			if (this.realFetch) {
				this.global.fetch = this.realFetch;
				this.realFetch = null;
			}
			this.fallbackResponse = null;
			return this;
		}
	}, {
		key: 'catch',
		value: function _catch(response) {
			if (this.fallbackResponse) {
				console.warn('calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response');
			}
			this.fallbackResponse = response || 'ok';
			return this._mock();
		}
	}, {
		key: 'spy',
		value: function spy() {
			this._mock();
			return this.catch(this.realFetch);
		}
	}, {
		key: 'fetchMock',
		value: function fetchMock(url, opts) {
			var _this = this;

			var response = this.router(url, opts);

			if (!response) {
				console.warn('unmatched call to ' + url);
				this.push(null, [url, opts]);

				if (this.fallbackResponse) {
					response = this.fallbackResponse;
				} else {
					throw new Error('unmatched call to ' + url);
				}
			}

			if (typeof response === 'function') {
				response = response(url, opts);
			}

			if (typeof response.then === 'function') {
				return response.then(function (response) {
					return _this.mockResponse(url, response, opts);
				});
			} else {
				return this.mockResponse(url, response, opts);
			}
		}
	}, {
		key: 'router',
		value: function router(url, opts) {
			var route = void 0;
			for (var i = 0, il = this.routes.length; i < il; i++) {
				route = this.routes[i];
				if (route.matcher(url, opts)) {
					this.push(route.name, [url, opts]);
					return route.response;
				}
			}
		}
	}, {
		key: 'addRoute',
		value: function addRoute(route) {

			if (!route) {
				throw new Error('.mock() must be passed configuration for a route');
			}

			// Allows selective application of some of the preregistered routes
			this.routes.push(compileRoute(route, this.Request));
		}
	}, {
		key: 'mockResponse',
		value: function mockResponse(url, responseConfig, fetchOpts) {
			// It seems odd to call this in here even though it's already called within fetchMock
			// It's to handle the fact that because we want to support making it very easy to add a
			// delay to any sort of response (including responses which are defined with a function)
			// while also allowing function responses to return a Promise for a response config.
			if (typeof responseConfig === 'function') {
				responseConfig = responseConfig(url, fetchOpts);
			}

			if (this.Response.prototype.isPrototypeOf(responseConfig)) {
				return Promise.resolve(responseConfig);
			}

			if (responseConfig.throws) {
				return Promise.reject(responseConfig.throws);
			}

			if (typeof responseConfig === 'number') {
				responseConfig = {
					status: responseConfig
				};
			} else if (typeof responseConfig === 'string' || !(responseConfig.body || responseConfig.headers || responseConfig.throws || responseConfig.status)) {
				responseConfig = {
					body: responseConfig
				};
			}

			var opts = responseConfig.opts || {};
			opts.url = url;
			opts.sendAsJson = responseConfig.sendAsJson === undefined ? this.config.sendAsJson : responseConfig.sendAsJson;
			if (responseConfig.status && (typeof responseConfig.status !== 'number' || parseInt(responseConfig.status, 10) !== responseConfig.status || responseConfig.status < 200 || responseConfig.status > 599)) {
				throw new TypeError('Invalid status ' + responseConfig.status + ' passed on response object.\nTo respond with a JSON object that has status as a property assign the object to body\ne.g. {"body": {"status: "registered"}}');
			}
			opts.status = responseConfig.status || 200;
			opts.statusText = this.statusTextMap['' + opts.status];
			// The ternary operator is to cope with new Headers(undefined) throwing in Chrome
			// https://code.google.com/p/chromium/issues/detail?id=335871
			opts.headers = responseConfig.headers ? new this.Headers(responseConfig.headers) : new this.Headers();

			var body = responseConfig.body;
			if (opts.sendAsJson && responseConfig.body != null && (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object') {
				//eslint-disable-line
				body = JSON.stringify(body);
			}

			if (this.stream) {
				var s = new this.stream.Readable();
				if (body != null) {
					//eslint-disable-line
					s.push(body, 'utf-8');
				}
				s.push(null);
				body = s;
			}

			return Promise.resolve(new this.Response(body, opts));
		}
	}, {
		key: 'push',
		value: function push(name, call) {
			if (name) {
				this._calls[name] = this._calls[name] || [];
				this._calls[name].push(call);
				this._matchedCalls.push(call);
			} else {
				this._unmatchedCalls.push(call);
			}
		}
	}, {
		key: 'restore',
		value: function restore() {
			this._unMock();
			this.reset();
			this.routes = [];
			return this;
		}
	}, {
		key: 'reset',
		value: function reset() {
			this._calls = {};
			this._matchedCalls = [];
			this._unmatchedCalls = [];
			this.routes.forEach(function (route) {
				return route.reset && route.reset();
			});
			return this;
		}
	}, {
		key: 'calls',
		value: function calls(name) {
			return name ? this._calls[name] || [] : {
				matched: this._matchedCalls,
				unmatched: this._unmatchedCalls
			};
		}
	}, {
		key: 'lastCall',
		value: function lastCall(name) {
			var calls = name ? this.calls(name) : this.calls().matched;
			if (calls && calls.length) {
				return calls[calls.length - 1];
			} else {
				return undefined;
			}
		}
	}, {
		key: 'lastUrl',
		value: function lastUrl(name) {
			var call = this.lastCall(name);
			return call && call[0];
		}
	}, {
		key: 'lastOptions',
		value: function lastOptions(name) {
			var call = this.lastCall(name);
			return call && call[1];
		}
	}, {
		key: 'called',
		value: function called(name) {
			if (!name) {
				return !!(this._matchedCalls.length || this._unmatchedCalls.length);
			}
			return !!(this._calls[name] && this._calls[name].length);
		}
	}, {
		key: 'done',
		value: function done(name) {
			var _this2 = this;

			var names = name ? [name] : this.routes.map(function (r) {
				return r.name;
			});
			// Ideally would use array.every, but not widely supported
			return names.map(function (name) {
				if (!_this2.called(name)) {
					return false;
				}
				// would use array.find... but again not so widely supported
				var expectedTimes = (_this2.routes.filter(function (r) {
					return r.name === name;
				}) || [{}])[0].times;
				return !expectedTimes || expectedTimes <= _this2.calls(name).length;
			}).filter(function (bool) {
				return !bool;
			}).length === 0;
		}
	}, {
		key: 'configure',
		value: function configure(opts) {
			_extends(this.config, opts);
		}
	}]);

	return FetchMock;
}();

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach(function (method) {
	FetchMock.prototype[method] = function (matcher, response, options) {
		return this.mock(matcher, response, _extends({}, options, { method: method.toUpperCase() }));
	};
	FetchMock.prototype[method + 'Once'] = function (matcher, response, options) {
		return this.once(matcher, response, _extends({}, options, { method: method.toUpperCase() }));
	};
});

module.exports = function (opts) {
	return new FetchMock(opts);
};
},{"./compile-route":2}],4:[function(require,module,exports){
'use strict';

var statusTextMap = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',
  '208': 'Already Reported',
  '226': 'IM Used',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Found',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '308': 'Permanent Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Timeout',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Payload Too Large',
  '414': 'URI Too Long',
  '415': 'Unsupported Media Type',
  '416': 'Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': 'I\'m a teapot',
  '421': 'Misdirected Request',
  '422': 'Unprocessable Entity',
  '423': 'Locked',
  '424': 'Failed Dependency',
  '425': 'Unordered Collection',
  '426': 'Upgrade Required',
  '428': 'Precondition Required',
  '429': 'Too Many Requests',
  '431': 'Request Header Fields Too Large',
  '451': 'Unavailable For Legal Reasons',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
  '508': 'Loop Detected',
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended',
  '511': 'Network Authentication Required'
};

module.exports = statusTextMap;
},{}]},{},[1])(1)
});