// plugins/matomo.client.js

export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        var _paq = (window._paq = window._paq || []);
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(["trackPageView"]);
        _paq.push(["enableLinkTracking"]);
        (function () {
            var u = nuxtApp.$config.public.matomo_host;
            _paq.push(["setTrackerUrl", u + "matomo.php"]);
            _paq.push(["setSiteId", nuxtApp.$config.public.matomo_site_id]);
            var d = document,
                g = d.createElement("script"),
                s = d.getElementsByTagName("script")[0];
            g.async = true;
            g.src = u + "matomo.js";
            s.parentNode.insertBefore(g, s);
        })();
    }
  });