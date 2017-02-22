var fields = (fields || {});
if (global) global.fields = fields;

// GENERIC EXTRACTION FUNCTIONS

fields.getObject = function(issue, field_name) {
  return issue.fields[field_name];
};

fields.getObjectName = function(issue, field_name) {
  return issue.fields[field_name].name;
};

fields.getObjectEmail = function(issue, field_name) {
  return issue.fields[field_name].emailAddress;
};

fields.getAllObjects = function(issue, field_name) {
  var values = issue.fields[field_name];

  return values.join(',');  
};

fields.getAllObjectsName = function(issue, field_name) {
  var values = issue.fields[field_name];
  
  values = values.map(function (item) {
    return item.name
  });

  return values.join(',');  
};

fields.getDateFromObject = function(issue, field_name) {
  return new Date(utils.parseDate(issue.fields[field_name]));
};


// SPECIFIC EXTRACTION FUNCTIONS

fields.getKey = function(issue, field_name) {
  return issue.key;
};

fields.getStatus = function(issue, field_name) {
  return issue.fields.status.name.toUpperCase();
};

fields.getSprint = function(issue, field_name) {
  var sprint = null;
  var value = issue.fields[field_name];
  
  if (value != null && value.length > 0) {
    var sprintArray = value[value.length-1].split("name=")[1].split(",")[0].split(/[, ]+/);
    sprint = sprintArray[1];
  }
  
  return sprint;
};

jira.init();
