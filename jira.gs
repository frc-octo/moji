// API DOCUMENTATION >> https://docs.atlassian.com/jira/REST/cloud/

var jira = {};
if (global) global.jira = jira;

jira.init = function () {
  jira.fields = {
    'Key'       : { name: 'Key'               , field: null, fn: fields.getKey },
    'Summary'   : { name: 'Summary'           , field: null, fn: fields.getObject },
    'Status'    : { name: 'Status'            , field: null, fn: fields.getStatus },
    'Estimation': { name: 'Story Points'      , field: null, fn: fields.getObject },
    'Epic'      : { name: 'Epic Name'         , field: null, fn: fields.getObject },
    'Version'   : { name: 'Fix Version/s'     , field: null, fn: fields.getAllObjectsName },
    'Sprint'    : { name: 'Sprint'            , field: null, fn: fields.getSprint },
    'Components': { name: 'Component/s'       , field: null, fn: fields.getAllObjectsName },
    'Labels'    : { name: 'Labels'            , field: null, fn: fields.getAllObjects },
    'Priority'  : { name: 'Priority'          , field: null, fn: fields.getObjectName },
    'Type'      : { name: 'Issue Type'        , field: null, fn: fields.getObjectName },
    'Date'      : { name: 'Created'           , field: null, fn: fields.getDateFromObject },
    'Creator'   : { name: 'Creator'           , field: null, fn: fields.getObjectEmail }
  };
};

/***************************************/

jira.testConnection = function() {
  var value = false;

  var query = {
    path: '/rest/api/2/mypermissions',
    method: 'GET',
    parameters: {}
  };
  
  var callback = function(json) {
    value = (json == null) ? false : true;
  };

  api.sendRequest(query, callback);
  return value;
};

/***************************************/

jira.getProjects = function() {
  var value = null;

  var query = {
    path: '/rest/api/2/project',
    method: 'GET',
    parameters: {}
  };
  
  var callback = function(json) {
    value = json;
  };
  
  api.sendRequest(query, callback);
  return value;
};

jira.readProject = function(project) {
  var properties = PropertiesService.getScriptProperties();
  
  return JSON.parse(properties.getProperty('project'));
};

jira.saveProject = function(project) {
  var properties = PropertiesService.getScriptProperties();
  if (typeof project == 'object') project = JSON.stringify(project);
  
  return properties.setProperty('project', project);  
};

/***************************************/

jira.getFields = function() {
  var value = null;

  var query = {
    path: '/rest/api/2/field',
    method: 'GET',
    parameters: {}
  };
  
  var callback = function(json) {
    value = json.map(function(item) {
      return {
        name: item.name,
        id: item.id,
        type: (item.schema) ? item.schema.type : '',
        custom: (item.schema) ? (item.schema.custom || ':').split(':')[1] : ''
      };
    }).sort(function(a, b) { return a.name.localeCompare(b.name); });
  };
  
  api.sendRequest(query, callback);
  return value;
};

jira.getMinFields = function() {
  var fields = [];
  
  for (var label in jira.fields)
    fields.push({
      'label': label,
      'name': jira.fields[label].name,
      'tech': null
    });
  
  return fields;
};

jira.readExportFields = function() {
  var properties = PropertiesService.getScriptProperties();
  
  var fields_ = JSON.parse(properties.getProperty('fields'));
  fields_ = fields_ || jira.getMinFields();
  
  fields_.forEach(function(item) {
    var field = jira.fields[item.label];
    item.fn = (field) ? field.fn : fields.getObject;
  });
  
  return fields_;
};

jira.saveExportFields = function(fields) {
  var properties = PropertiesService.getScriptProperties();
  
  if (typeof fields == 'object') fields = JSON.stringify(fields);
  
  return properties.setProperty('fields', fields);
};

/***************************************/

jira.getStatuses = function() {
  var value = null;
  var project = jira.readProject();

  var query = {
    path: '/rest/api/2/project/'+project.id+'/statuses',
    method: 'GET',
    parameters: {}
  };
  
  var callback = function(json) {
    var result = {};

    for (var type in json) {
      var statuses = json[type].statuses;
      for (var id in statuses) {
        var status = statuses[id].name;

        result[status] = true;
      }
    }
    
    value = Object.keys(result);
  };
  
  api.sendRequest(query, callback);
  return value;
};

/***************************************/

jira.getBacklog = function() {
  var project = jira.readProject();
  
  return { issues: jira.getData('project=' + project.id) };
};

/***************************************/

jira.getData = function(jql) {
  var values = [];
  
  var query = {
    path: '/rest/api/2/search',
    method: 'GET',
    
    parameters: {
      jql: jql,
      startAt: 0,
      maxResults: 200
    }
  };
  
  var callback = function(data) {
    Logger.log(data);
    values = values.concat(data.issues);

    query.parameters.startAt = data.startAt + data.maxResults;
    if (query.parameters.startAt < data.total)
      api.sendRequest(query, callback);
  };
  
  api.sendRequest(query, callback);
  return values;
}
