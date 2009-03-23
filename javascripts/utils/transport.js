        // transport
        transport = (function(){
            //var baseUrl = iwiw ? "http://flashcard-test.appspot.com/api" : "/api";
            var baseUrl = iwiw ? window.baseUrl : "";

            var encodeData = function(o) {
                var ret = [],
                    e = encodeURIComponent;
                Y.each(o, function(v,k){
                    ret.push(e(k) + '=' + e(v));
                });

                return ret.join('&');
            };

            var iwiwRequest = function(method, path, callback, params) {
                var transportParams ={};
                var jsonParams = {};
                transportParams[gadgets.io.RequestParameters.METHOD] = method;

                if (method == 'GET' && params) {
                    path = path + "?" + encodeData(params);
                }
                if (method != 'GET') {
                    params = params || {};
                    if (method != 'POST') {
                        jsonParams['_method'] = method;
                    }
                    jsonParams['json'] = Y.JSON.stringify(params);
                    var post_data = gadgets.io.encodeValues(jsonParams);
                    transportParams[gadgets.io.RequestParameters.POST_DATA] = post_data;
                }
                transportParams[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
                transportParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

                var url = baseUrl + path;
                gadgets.io.makeRequest(url,callback,transportParams);
            };

            var normalRequest = function(method, path, callback, params){
                params = params || {};
                params['opensocial_owner_id'] = 'sandbox.iwiw.hu:Xm9W017W9Vg';

                if (method != 'GET') {
                    params = {json: Y.JSON.stringify(params)};
                    if (method != 'POST') {
                        params['_method'] = method;
                        method = 'POST';
                    }
                }

                var data = encodeData(params);

                Y.io(baseUrl+path, {
                    method: method,
                    data: data,
                    // headers: {
                    //     'Content-Type': 'application/json'
                    // },
                    on: {
                        complete: function(tId,resp,args){
                            var data = Y.JSON.parse(resp.responseText);
                            callback({data:data});
                        }
                    }
                });
            };

            var makeRequest = function(method, path, callback, params, statusMsg){
                var request = iwiw ? iwiwRequest : normalRequest;
                statusBar.working(statusMsg);
                var patchedCallback = function(){
                    statusBar.finished();
                    callback.apply(null, arguments);
                };
                request(method, path, patchedCallback, params);
            };

            return {
                GET: function(path, callback, params, statusMsg) {
                    makeRequest('GET', path, callback, params, statusMsg);
                },
                POST: function(path, callback, params, statusMsg) {
                    makeRequest('POST', path, callback, params, statusMsg);
                },
                PUT: function(path, callback, params, statusMsg) {
                    makeRequest('PUT', path, callback, params, statusMsg);
                },
                DELETE: function(path, callback, params, statusMsg) {
                    makeRequest('DELETE', path,callback, params, statusMsg);
                }
            };
        }());
