var fields = (fields || {});
if (global) global.fields = fields;

// GENERIC EXTRACTION FUNCTIONS

fields.getObject = function(issue, field_name) {
  return issue.fields[field_name];
};

fields.getObjectName = function(issue, field_name) {
   if (issue.fields[field_name] != null) {return issue.fields[field_name].name};
};

fields.getObjectEmail = function(issue, field_name) {
  if (issue.fields[field_name] != null) {return issue.fields[field_name].emailAddress};
};

fields.getAllObjects = function(issue, field_name) {
  if (issue.fields[field_name] != null) {
    var values = issue.fields[field_name];
    return values.join(',');
  }
};

fields.getAllObjectsName = function(issue, field_name) {
  var values = issue.fields[field_name];
  if (values != null) {
    values = values.map(function (item) {
      return item.name
    });
    
    return values.join(',');  
  }
};

fields.getDateFromObject = function(issue, field_name) {
  if (issue.fields[field_name] != null) {
    return new Date(utils.parseDate(issue.fields[field_name]));
  }
};


// SPECIFIC EXTRACTION FUNCTIONS

fields.getKey = function(issue, field_name) {
  return issue.key;
};

fields.getStatus = function(issue, field_name) {
  return issue.fields.status.name.toUpperCase();
};

fields.getSprint = function(issue, field_name) {
  var sprints = [];
  var values = issue.fields[field_name];
  
  if (values != null && values.length > 0)
    values.forEach(function(value) {
      var re = /name=[^\d]*([\d]+)[^\d].*,/;
      var sprintArray = re.exec(value);
      
      sprints.push((sprintArray && sprintArray.length) ? sprintArray.pop() : null);
    });
  
  return sprints.length ? Math.max.apply(null, sprints) : null;
};

jira.init();