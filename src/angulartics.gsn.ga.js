(function (window, gsn, angular, undefined) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.gsn.ga
   * Enables analytics support for Google Analytics (http://google.com/analytics)
   */
  angular.module('angulartics.gsn.ga', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    $analyticsProvider.init = function () {
      // GA already supports buffered invocations so we don't need
      // to wrap these inside angulartics.waitForVendorApi
      if ($analyticsProvider.settings) {
        $analyticsProvider.settings.trackRelativePath = true;
      }
      
      var firstTracker = (gsn.isNull(gsn.config.GoogleAnalyticAccountId1, '').length > 0);
      var secondTracker = (gsn.isNull(gsn.config.GoogleAnalyticAccountId2, '').length > 0);

      if (window.ga) {
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
        if (window.ga) {
          ga('send', 'pageview', path);

          if (secondTracker) {
            ga('trackerTwo.send', 'pageview', path);
          }
        }
        
        // piwik tracking
        if (window._paq) {
          _paq.push(['setCustomUrl', path]);
          _paq.push(['trackPageView']);
        }
        
        // quantcast tracking
        if (window._qevents) {
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

        if (window.ga) {
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
        
        if (window.Piwik) {
          var tracker = Piwik.getAsyncTracker();
          tracker.trackEvent(properties.category, action, properties.label, properties.value);
        }
      });
    };
  }]);
})(window, gsn, angular);