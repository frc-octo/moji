var utils = {};
if (global)  global.utils = utils;

utils.parseDate = function(string) {
  try {
    var parts = string.split('T');
    parts[0] = parts[0].replace(/-/g, '/');
    if (parts.length > 1) {
      parts[1] = parts[1].replace(/([-+])/g, ' $1');
      parts[1] = parts[1].replace(/\.\d*/g, '');
    }
    
    var date_str = parts.join(' ');
    return Date.parse(date_str);
  } catch (e) {
    Logger.log('Error parsing date : ' + string);
    return string;
  }
};

utils.clearTriggers = function() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
};

utils.createUpdateTrigger = function() {
  ScriptApp.newTrigger('globalUpdate')
  .timeBased()
  .everyDays(1)
  .atHour(22)
  .create();
};
