/*global console, $, axecore, hf*/
$(document).ready(function () {
  'use strict';
  var getCookie =  function (cookieName) {
    var
      i, c, len,
      nameEQ = cookieName + "=",
      cookies = document.cookie.split(';');
    for (i = 0, len = cookies.length; i < len; i = i + 1) {
      c = cookies[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    return '';
  };

  if (window.location
        .href.indexOf("www.alaskaair.com/Shopping/Flights") === -1
      && getCookie("!AXECORE").toUpperCase() !== 'DISABLE') {
	axecore.bDebug = true;
    (function (window, document, $) {
      var
        deprecatedA11yDivs
        = $("#duplicateIdaccessibilityViolation, #missing-alt-tags"),
        bSuspend = true,
        MutationObserver,
        myObserver,
        obsConfig,
        nAxeCoreDomUpdated = 0,
        AxeCoreOptions = {},
        targetNodes = $('body > '
                        + ':not(#sessionSection)'
                        + ':not(#homepage-advisory)'
                        + ':not(#sitewide-advisory)'
                        + ':not(#duplicateIdaccessibilityViolation)'
                        + ':not(#missing-alt-tags)'
                        + ':not(.axeclass)'
                        + ':not(#divFormFiller)'
                        + ':not(#iFiller)');


      if (deprecatedA11yDivs.length > 0) {
        deprecatedA11yDivs.remove();
      }

      function removingMenuAcceptableErrors(results) {
        var i = 0, j = 0;
        for (i = 0; i < results.violations.length; i = i + 1) {
          if (results.violations[i].id === 'aria-allowed-attr') {
            for (j = 0; j < results.violations[i].nodes.length; j = j + 1) {
              if (typeof (results.violations[i].nodes[j].html) !== 'undefined'
                  && results.violations[i]
                      .nodes[j].html.indexOf('role="menuitem"')
                  !== -1) {
                results.violations[i].nodes.splice(j, 1);
                j = j - 1;
              }
            }

            if (results.violations[i].nodes.length === 0) {
              results.violations.splice(i, 1);
              i = i - 1;
            }
          } else if (results.violations[i].id === 'color-contrast') {
            for (j = 0; j < results.violations[i].nodes.length; j = j + 1) {
              if (typeof (results.violations[i].nodes[j].html) !== 'undefined'
                  && results.violations[i]
                      .nodes[j].html.indexOf('id="day')
                  !== -1) {
                results.violations[i].nodes.splice(j, 1);
                j = j - 1;
              }
            }

            if (results.violations[i].nodes.length === 0) {
              results.violations.splice(i, 1);
              i = i - 1;
            }
          }
        }
        return results;
      }

      function announceResults(results) {
        var
          i = 0, j = 0,
          axeDiv, axeh, ul, li, ul2, li2, hf;

        hf = document.querySelector('#homepage-advisory')
            || document.querySelector('#sitewide-advisory');
        if (hf) {
          hf.setAttribute("style",
                        "margin-top: "
                        + (80 + (results.violations.length * 15))  + "px;");
        }
        axeDiv = document.createElement("div");
        axeDiv.setAttribute("class", "axeclass");
        axeDiv.setAttribute("style",
                            "position:fixed;"
                            + "top:0;"
                            + "width:100%;"
                            + "z-index:1000;"
                            + "background-color: rgb(255, 100, 255);"
                            + "color: rgb(0, 0, 0);"
                            + "padding-left: 20px;");
        axeh = document.createElement("div");
        axeh.setAttribute("style",
                            "font-weight:bold;"
                            + "margin-top:10px;"
                            + "font-size:16px;");
        axeh.appendChild(
          document
            .createTextNode("A11y violations are found" +
                          " - run Axe extension for detail:")
        );
        axeDiv.appendChild(axeh);
        ul = document.createElement('ul');
        ul.setAttribute("class", "axeclass");
        li = null;
        for (i = 0; i < results.violations.length; i = i + 1) {
          li = document.createElement('li');
          li.setAttribute("class", "axeclass");
          li.setAttribute("style", "font-weight:bold");
          li.appendChild(
            document
               .createTextNode(results.violations[i].description
                  + " in "
                  + results.violations[i].nodes.length
                  + " element"
                  + (results.violations[i].nodes.length > 1 ? 's.' : '.'))
          );

          ul.appendChild(li);
        }
        axeDiv.appendChild(ul);
        document.querySelector('body')
          .insertBefore(axeDiv, document.querySelector('div'));
      }

      function axeCallback(results) {
        var hf;
        if (document.querySelector('div.axeclass')) {
          document.querySelector('body')
            .removeChild(document.querySelector('div.axeclass'));
          hf = document.querySelector('#homepage-advisory')
              || document.querySelector('#sitewide-advisory');
          if (hf) {
            hf.setAttribute("style", "");
          }
        }
        results = removingMenuAcceptableErrors(results);
        if (results.violations.length > 0) {
          announceResults(results);
        }
        bSuspend = true;
      }

      function accessibilityCheck() {
        if(bSuspend) {
          bSuspend = false;
          axecore.a11yCheck(document, AxeCoreOptions, axeCallback);
        }
      }

      function injectAxeIntoIFrames() {
        var
          iframes = document.querySelectorAll('iframe'),
          i = 0,
          script = null;
        for (i = 0; i < iframes.length; i = i + 1) {
          try {
            if (iframes[i].contentWindow.document
                && !iframes[i]
                  .contentWindow
                  .document
                  .querySelector(
                  '[src="https://www.alaskaair.com/javascripts/axe.js"]'
                )
                ) {
              script = iframes[i].contentWindow.document.createElement("script");
              script.type = "text/javascript";
              script.src = "https://www.alaskaair.com/javascripts/axe.js";
              iframes[i].contentWindow.document.body.appendChild(script);

              // Add the iframe to Mutation Observer
              myObserver.observe(iframes[i].contentWindow.document, obsConfig);
            }
          } catch (e) {
          }
        }
      }

      function runAxe(mutationRecords, lastnUpdated) {
        return function () {
          if (lastnUpdated === nAxeCoreDomUpdated) {
            accessibilityCheck();
          }
        };
      }

      function mutationHandler(mutationRecords) {
        var bNeedCheck = false;
        if (mutationRecords.length > 0) {
          if ((typeof (mutationRecords[0].target.getAttribute) === 'function'
                && mutationRecords[0]
                    .target.getAttribute('class') !== 'easybizco')
              &&
              (typeof (mutationRecords[0].target.getAttribute) === 'function'
                && mutationRecords[0]
                    .target.getAttribute('class') !== 'axeclass')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class') !==
                  'navbar-greeting-name focus-underline populate-display-name')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('id')
                  !== 'ShoulderLeftArrow1')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class')
                  !== 'module-fd--priceline')
              &&
              (mutationRecords[0].target
			    && (mutationRecords[0].target.getAttribute('id') === null
					|| mutationRecords[0].target.getAttribute('id').match(/legend/gi) === null)
			  )
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class')
                  !== 'exit left-exit')
              ) {
            if (mutationRecords.length > 1) {
              if (mutationRecords[1].target
                  &&
                  (typeof (mutationRecords[1].target.getAttribute) === 'function'
                  && mutationRecords[1]
                      .target.getAttribute('class') !== 'cart-count')) {
                bNeedCheck = true;
              } else {
                bNeedCheck = false;
              }
            } else {
              bNeedCheck = true;
            }
          } else {
            bNeedCheck = false;
          }
        }
        if (bNeedCheck) {
          nAxeCoreDomUpdated = nAxeCoreDomUpdated + 1;
          injectAxeIntoIFrames();
          setTimeout(runAxe(mutationRecords, nAxeCoreDomUpdated), 100);
        }
      }

      MutationObserver = window.MutationObserver
        || window.WebKitMutationObserver;

      if(MutationObserver) {
        myObserver = new MutationObserver(mutationHandler);
        obsConfig = {
          childList: true,
          characterData: true,
          attributes: true,
          subtree: true
        };

        injectAxeIntoIFrames();
        setTimeout(accessibilityCheck, 3000);

        targetNodes.each(function () {
          myObserver.observe(this, obsConfig);
        });
      }
    }(window, window.document, $));
  }
});
