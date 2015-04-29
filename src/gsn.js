﻿/*!
 *  Project:        Utility
 *  Description:    Utility methods
 *  Author:         Tom Noogen
 *  License:        Grocery Shopping Network
 *  Version:        1.0.3
 *
 */
; (function () {
  'use strict';

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `gsn` variable.
  var previousGsn = root.gsn;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    slice = ArrayProto.slice,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeKeys = Object.keys;

  /* jshint -W055 */
  // Create a safe reference to the gsn object for use below.
  var gsn = function (obj) {
    if (obj instanceof gsn) return obj;
    if (!(this instanceof gsn)) return new gsn(obj);
    this._wrapped = obj;
    return this;
  };

  // Export the gsn object for **Node.js**, with
  // backwards-compatibility for the old `require()` API.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = gsn;
    }
    exports.gsn = gsn;
  } else {
    root.gsn = gsn;
  }

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf gsn
   * @type string
   */
  gsn.VERSION = '1.0.4';
  gsn.previousGsn = previousGsn;

  // internal config
  gsn.config = {
    // url config
    AuthServiceUrl: '/proxy/auth',
    StoreServiceUrl: '/proxy/store',
    ProfileServiceUrl: '/proxy/profile',
    ShoppingListServiceUrl: '/proxy/shoppinglist',
    LoggingServiceUrl: '/proxy/logging',
    YoutechCouponUrl: '/proxy/couponut',
    RoundyProfileUrl: '/proxy/roundy',
    MidaxServiceUrl: '/proxy/midax',
    ApiUrl: '',

    // global config
    Version: new Date().getTime(),
    EmailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ServiceUnavailableMessage: 'We are unable to process your request at this time.',

    // true to make use of localStorage for better caching of user info across session, useful in a phonegap or mobile site app
    UseLocalStorage: false,

    // chain specific config
    ContentBaseUrl: '/app',
    // SiteTheme: null,
    MaxResultCount: 50,
    ChainId: 0,
    ChainName: 'Grocery Shopping Network',
    DfpNetworkId: '/6394/digitalstore.test',
    GoogleAnalyticAccountId1: null,
    GoogleAnalyticAccountId2: null,
    GoogleSiteVerificationId: null,
    RegistrationFromEmailAddress: 'tech@grocerywebsites.com',
    EnableCircPlus: null,
    EnableShopperWelcome: null,
    FacebookAppId: null,
    FacebookPermission: null,
    GoogleSiteSearchCode: null,
    DisableLimitedTimeCoupons: false,
    hasRoundyProfile: false,
    Theme: null,
    HomePage: null,
    StoreList: null,
    AllContent: null
  };

  gsn.identity = function (value) {
    return value;
  };

  gsn.userAgent = root.navigator.userAgent;

  function detectIe() {
    var ua = gsn.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');

    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    if (trident > 0) {
      // IE 11 (or newer) => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    // other browser
    return false;
  }

  gsn.browser = {
    isIE: detectIe(),
    userAgent: gsn.userAgent,
    isMobile: /iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/gi.test(gsn.userAgent),
    isAndroid: /(android)/gi.test(gsn.userAgent),
    isIOS: /iP(hone|od|ad)/gi.test(gsn.userAgent)
  };
  //#region Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = gsn.each = gsn.forEach = function (obj, iterator, context) {
    if (gsn.isNull(obj, null) === null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = gsn.keys(obj);
      for (var j = 0, length2 = keys.length; j < length2; j++) {
        if (iterator.call(context, obj[keys[j]], keys[j], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  gsn.map = gsn.collect = function (obj, iterator, context) {
    var results = [];
    if (gsn.isNull(obj, null) === null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function (value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };
  //#endregion

  //#region methods
  // --------------------
  // Extend a given object with all the properties in passed-in object(s).
  // gsn.extend(destination, *source);
  gsn.extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      if (typeof (source) !== 'undefined') {
        gsn.forEach(source, function (v, k) {
          if (gsn.isNull(v, null) !== null) {
            obj[k] = v;
          }
        });
      }
    });
    return obj;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = gsn.some = gsn.any = function (obj, predicate, context) {
    predicate = predicate || gsn.identity;
    var result = false;
    if (gsn.isNull(obj, null) === null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function (value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
      return null;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  gsn.contains = gsn.include = function (obj, target) {
    if (gsn.isNull(obj, null) === null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function (value) {
      return value === target;
    });
  };

  // extend the current config
  gsn.applyConfig = function (config, dontUseProxy) {
    gsn.extend(gsn.config, config);

    gsn.config.HomePage = gsn.parsePartialContentData(gsn.config.HomePage);
    // determine if proxy should be replace with direct url to api
    var useProxy = !gsn.isNull(dontUseProxy, gsn.config.dontUseProxy);

    // use proxy and older android, then it must use proxy
    if (useProxy && gsn.browser.isAndroid) {
      var ua = gsn.browser.userAgent;
      var androidversion = parseFloat(ua.slice(ua.indexOf("Android") + 8));

      if (androidversion > 4) {
        return;
      }

      useProxy = false;
    }

    // if not useProxy, replace proxy with valid api url
    if (!useProxy) {
      gsn.forEach(gsn.config, function (v, k) {
        if (typeof (v) !== 'string' || v == 'ApiUrl') return;
        if (v.indexOf('/proxy/') >= 0) {
          gsn.config[k] = v.replace('/proxy/', gsn.config.ApiUrl + '/');
        }
      });
    }
  };

  // return defaultValue if null
  gsn.isNull = function (obj, defaultValue) {
    return (typeof (obj) === 'undefined' || obj === null) ? defaultValue : obj;
  };

  // return defaultValue if NaN
  gsn.isNaN = function (obj, defaultValue) {
    return (isNaN(obj)) ? defaultValue : obj;
  };

  // sort a collection base on a field name
  gsn.sortOn = function (collection, name) {
    if (gsn.isNull(collection, null) === null) return null;
    if (collection.length <= 0) return [];

    // detect attribute type, problem is if your first object is null or not string then this breaks
    if (typeof (collection[0][name]) == 'string') {
      collection.sort(function (a, b) {
        if ((a[name] && a[name].toLowerCase()) < (b[name] && b[name].toLowerCase())) return -1;
        if ((a[name] && a[name].toLowerCase()) > (b[name] && b[name].toLowerCase())) return 1;
        return 0;
      });
    } else {
      collection.sort(function (a, b) {
        if (a[name] < b[name]) return -1;
        if (a[name] > b[name]) return 1;
        return 0;
      });
    }

    return collection;
  };

  // clean keyword - for support of sending keyword to google dfp
  gsn.cleanKeyword = function (keyword) {
    var result = keyword.replace(/[^a-zA-Z0-9]+/gi, '_').replace(/^[_]+/gi, '');
    if (gsn.isNull(result.toLowerCase, null) !== null) {
      result = result.toLowerCase();
    }
    return result;
  };

  // group a list by a field name/attribute and execute post process function
  gsn.groupBy = function (list, attribute, postProcessFunction) {
    if (gsn.isNull(list, null) === null) return [];

    // First, reset declare result.
    var groups = [];
    var grouper = {};

    // this make sure all elements are correctly sorted
    gsn.forEach(list, function (item) {
      var groupKey = item[attribute];
      var group = grouper[groupKey];
      if (gsn.isNull(group, null) === null) {
        group = { key: groupKey, items: [] };
        grouper[groupKey] = group;
      }
      group.items.push(item);
    });

    // finally, sort on group
    var i = 0;
    gsn.forEach(grouper, function (myGroup) {
      myGroup.$idx = i++;
      groups.push(myGroup);

      if (postProcessFunction) postProcessFunction(myGroup);
    });

    return gsn.sortOn(groups, 'key');
  };

  // map a list to object, todo: there is this better array map some where
  gsn.mapObject = function (list, attribute) {
    var obj = {};
    if (list) {
      if (gsn.isNull(list.length, -1) < 0) {
        obj[list[attribute]] = list;
      } else {
        gsn.map(list, function (item, i) {
          obj[item[attribute]] = item;
        });
      }
    }
    return obj;
  };

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  gsn.keys = nativeKeys || function (obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (gsn.has(obj, key)) keys.push(key);
    return keys;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  gsn.has = function (obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  gsn.getUrl = function (baseUrl, url) {
    url = gsn.isNull(url, '');
    var data = ((url.indexOf('?') > 0) ? '&' : '?') + 'nocache=' + gsn.config.Version;
    return (baseUrl + url + data).replace(/(\\\\)+/gi, '\\');
  };

  // get the content url
  gsn.getContentUrl = function (url) {
    return gsn.getUrl(gsn.config.ContentBaseUrl, url);
  };

  gsn.getThemeUrl = function (url) {
    var baseUrl = gsn.config.ContentBaseUrl;

    if (gsn.isNull(gsn.config.SiteTheme, '').length > 0) {
      baseUrl = baseUrl.replace('/' + gsn.config.ChainId, '/' + gsn.config.SiteTheme);
    }

    return gsn.getUrl(baseUrl, url);
  };

  gsn.setTheme = function (theme) {
    gsn.config.SiteTheme = theme;
  };

  gsn.goUrl = function (url, target) {
    // do nothing, dummy function to be polyfill later
  };

  // support angular initialization
  gsn.initAngular = function ($sceProvider, $sceDelegateProvider, $locationProvider, $httpProvider, FacebookProvider, $analyticsProvider) {
    gsn.config.hasRoundyProfile = [215, 216, 217, 218].indexOf(gsn.config.ChainId) > -1;
    gsn.config.DisableLimitedTimeCoupons = (215 ==  gsn.config.ChainId);
    if (gsn.config.Theme) {
      gsn.setTheme(gsn.config.Theme);
    }

    //#region security config
    // For security reason, please do not disable $sce
    // instead, please use trustHtml filter with data-ng-bind-html for specific trust
    $sceProvider.enabled(!gsn.browser.isIE);

    $sceDelegateProvider.resourceUrlWhitelist(gsn.config.SceWhiteList || [
      'self', 'http://localhost:3000/**', 'http://**.gsn.io/**', 'https://**.gsn2.com/**', 'http://*.gsngrocers.com/**', 'https://*.gsngrocers.com/**']);


    //gets rid of the /#/ in the url and allows things like 'bootstrap collapse' to function
    if (typeof ($locationProvider) !== "undefined") {
      $locationProvider.html5Mode(true).hashPrefix('!');
    }

    if (typeof($httpProvider) !== "undefined") {
      $httpProvider.interceptors.push('gsnAuthenticationHandler');

      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header used to identify ajax call  that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

    if (typeof(FastClick) !== "undefined") {
      FastClick.attach(document.body);
    }

    if (typeof(FacebookProvider) !== "undefined") {
      FacebookProvider.init(gsn.config.FacebookAppId);
    }

    if (typeof($analyticsProvider) !== "undefined") {
      $analyticsProvider.init();
    }
  };
  //#endregion

  if (root.globalConfig) {
    gsn.config.ApiUrl = gsn.isNull(root.globalConfig.apiUrl, '').replace(/\/+$/g, '');
  }

  //#region dynamic script loader
  function loadSingleScript(uri, callbackFunc) {
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    tag.src = uri;
    if (callbackFunc) {
      tag.onload = maybeDone;
      tag.onreadystatechange = maybeDone; // For IE8-
    }

    document.body.appendChild(tag);

    /* jshint -W040 */
    function maybeDone() {
      if (this.readyState === undefined || this.readyState === 'complete') {
        // Pull the tags out based on the actual element in case IE ever
        // intermingles the onload and onreadystatechange handlers for the same
        // script block before notifying for another one.
        if (typeof (callbackFunc) === 'function') callbackFunc();
      }
    }
    /* jshint +W040 */
  }

  gsn.loadScripts = function (uris, callbackFunc) {
    if (gsn.isNull(uris.length, 0) <= 0) {
      if (typeof (callbackFunc) === 'function') {
        callbackFunc();
      }
    }
    else {
      var toProcess = [].concat(uris);
      processNext();
    }

    function processNext() {
      if (toProcess.length <= 0) {
        if (typeof (callbackFunc) === 'function') {
          callbackFunc();
        }
      }
      else {
        var item = toProcess[0];
        toProcess.splice(0, 1);
        loadSingleScript(item, processNext);
      }
    }
  };

  gsn.loadIframe = function (parentEl, html) {
    var iframe = document.createElement('iframe');
    parentEl[0].appendChild(iframe);

    /* jshint -W107 */
    if (iframe.contentWindow) {
      iframe.contentWindow.contents = html;
      iframe.src = 'javascript:window["contents"]';
    } else {
      var doc = iframe.document;
      if (iframe.contentDocument) doc = iframe.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();
    }
    /* jshint +W107 */

    return iframe;
  };
  //#endregion

  gsn.parsePartialContentData = function(data) {
    if (gsn.isNull(data, null) === null) {
      data = { ConfigData: {}, ContentData: {}, ContentList: [] };
    }

    var result = data;
    if (result.ConfigData) {
      return result;
    }

    var configData = [];
    var contentData = [];

    // parse home config
    if (result.Contents) {
      gsn.forEach(result.Contents, function (v, k) {
        if (v.IsMetaData) configData.push(v);
        else contentData.push(v);
      });

      result.Contents = null;
      result.ConfigData = gsn.mapObject(configData, 'Headline');
      result.ContentData = gsn.mapObject(contentData, 'SortBy');
      var contentList = [];
      for (var i = 0; i < contentData.length; i++) {
        contentList.push(contentData[i]);
      }

      if (contentList.length > 0) {
        result.ContentList = gsn.sortOn(contentList, "SortBy");
      }
    }

    return result;
  };

  gsn.initAnalytics = function($analyticsProvider){
    $analyticsProvider.init = function () {
      // GA already supports buffered invocations so we don't need
      // to wrap these inside angulartics.waitForVendorApi
      if ($analyticsProvider.settings) {
        $analyticsProvider.settings.trackRelativePath = true;
      }

      var firstTracker = (gsn.isNull(gsn.config.GoogleAnalyticAccountId1, '').length > 0);
      var secondTracker = (gsn.isNull(gsn.config.GoogleAnalyticAccountId2, '').length > 0);

      if (root.ga) {
        // creating google analytic object
        if (firstTracker) {
          ga('create', gsn.config.GoogleAnalyticAccountId1, 'auto');

          if (secondTracker) {
            ga('create', gsn.config.GoogleAnalyticAccountId2, 'auto', { 'name': 'trackerTwo' });
          }
        } else if (secondTracker) {
          secondTracker = false;
          ga('create', gsn.config.GoogleAnalyticAccountId2, 'auto');
        }

        // enable demographic
        ga('require', 'displayfeatures');
      }

      // GA already supports buffered invocations so we don't need
      // to wrap these inside angulartics.waitForVendorApi

      $analyticsProvider.registerPageTrack(function (path) {
        // begin tracking
        if (root.ga) {
          ga('send', 'pageview', path);

          if (secondTracker) {
            ga('trackerTwo.send', 'pageview', path);
          }
        }

        // piwik tracking
        if (root._paq) {
          _paq.push(['setCustomUrl', path]);
          _paq.push(['trackPageView']);
        }

        // quantcast tracking
        if (root._qevents) {
          _qevents.push({
            qacct: "p-1bL6rByav5EUo"
          });
        }
      });

      /**
      * Track Event in GA
      * @name eventTrack
      *
      * @param {string} action Required 'action' (string) associated with the event
      * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
      *
      * @link https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide#SettingUpEventTracking
      *
      * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/events
      */
      $analyticsProvider.registerEventTrack(function (action, properties) {
        // GA requires that eventValue be an integer, see:
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
        // https://github.com/luisfarzati/angulartics/issues/81
        if (properties.value) {
          var parsed = parseInt(properties.value, 10);
          properties.value = isNaN(parsed) ? 0 : parsed;
        }

        if (root.ga) {
          if (properties.noninteraction) {
            ga('send', 'event', properties.category, action, properties.label, properties.value, { nonInteraction: 1 });
            if (secondTracker) {
              ga('trackerTwo.send', 'event', properties.category, action, properties.label, properties.value, { nonInteraction: 1 });
            }
          } else {
            ga('send', 'event', properties.category, action, properties.label, properties.value);
            if (secondTracker) {
              ga('trackerTwo.send', 'event', properties.category, action, properties.label, properties.value);
            }
          }
        }

        if (root.Piwik) {
          var tracker = Piwik.getAsyncTracker();
          tracker.trackEvent(properties.category, action, properties.label, properties.value);
        }
      });
    };
  }
}).call(this);
