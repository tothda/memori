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

            var iwiwRequest = function(path, method, callback, params) {
                var transportParams ={};
                transportParams[gadgets.io.RequestParameters.METHOD] = method;

                if (method == 'GET' && params) {
                    path = path + "?" + encodeData(params);
                }
                if (method != 'GET') {
                    params = params || {};
                    if (method != 'POST') {
                        params['_method'] = method;
                    }
                    params['json'] = Y.JSON.stringify(params);
                    var post_data = gadgets.io.encodeValues(params);
                    transportParams[gadgets.io.RequestParameters.POST_DATA] = post_data;
                }
                transportParams[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
                transportParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

                var url = baseUrl + path;
                gadgets.io.makeRequest(url,callback,transportParams);
            };

            var normalRequest = function(path, method, callback, params){
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

            var makeRequest = iwiw ? iwiwRequest : normalRequest;

            return {
                GET: function(path, callback, params) {
                    makeRequest(path, "GET", callback, params);
                },
                POST: function(path, callback, params) {
                    makeRequest(path, "POST", callback, params);
                },
                PUT: function(path, callback, params) {
                    makeRequest(path, "PUT", callback, params);
                },
                DELETE: function(path, callback, params) {
                    makeRequest(path, "DELETE", callback, params);
                }
            };
        }());
