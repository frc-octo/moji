var api = {};
if (global) global.api = api;

api.readAccess = function() {
  var properties = PropertiesService.getUserProperties();
  var properties = PropertiesService.getScriptProperties();

  var server = {};
  
  server.protocol = properties.getProperty('protocol');
  server.hostname = properties.getProperty('hostname');
  
  server.auth_user = properties.getProperty('auth_user');
  server.auth_pass = properties.getProperty('auth_pass');
  server.auth_token = properties.getProperty('auth_token');
  
  return server;
}


api.saveAccess = function(url, user, pass) {
  var properties = PropertiesService.getUserProperties();
  var properties = PropertiesService.getScriptProperties();

  var parts = url.split('://');
  var token = (user && pass) ? Utilities.base64Encode(user + ':' + pass) : null;

  properties.setProperty('protocol', parts[0]);
  properties.setProperty('hostname', parts[1]);

  properties.setProperty('auth_user', user);
  properties.setProperty('auth_pass', pass);
  properties.setProperty('auth_token', token);
}


api.sendRequest = function(request, callback) {
  var server = api.readAccess();
  
  var json = null;
  var url = api.call.url(server, request);
  var options = api.call.options(server, request);

  try {
    json = JSON.parse(UrlFetchApp.fetch(url, options));
  } catch (err) {
    Logger.log('ERROR - on performing request : ' + JSON.stringify(request));
  };

  callback(json);
}


api.call = {
  url : function(server, request) {
    var param = [];
    
    for (var key in request.parameters) {
      var str = key + '=';
      
      if (Array.isArray(request.parameters[key])) {
        str += request.parameters[key].join(',');
      } else 
        str += encodeURIComponent(request.parameters[key]);
      param.push(str);
    }
    
    return server.protocol + '://' + server.hostname + request.path + '?' + param.join('&');
  },
  
  options : function(server, request) {
    var options = {};
    
    options['method'] = request.method;
    options['headers'] = {};
    
    if (server.auth_token)
      options['headers']['Authorization'] = 'Basic ' + server.auth_token;
    
    return options;
  }
};

