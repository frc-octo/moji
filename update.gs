var sheets = {
  backlog: 'Extract',
  daily:   'Daily Stats',
  sprint:  'Sprint Stats'
};

var update = {};

update.sheetColumns = function() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.backlog);
  var origin = sheet.getRange('C2');
  
  var nb_rows = sheet.getMaxRows() - origin.getRow();
  if (nb_rows > 0)
    sheet.deleteRows(origin.getRow(), nb_rows);

  var nb_cols = sheet.getMaxColumns() - origin.getColumn();
  if (nb_cols > 0)
    sheet.deleteColumns(origin.getColumn(), nb_cols);

  var fields = jira.readExportFields();
  sheet.insertColumnsBefore(origin.getColumn(), fields.length);  
  
  var row = -1;
  var col = 0;
  
  for (var key in fields) {
    var value =  fields[key].label;
    
    origin.offset(row, col++).setValue((value == undefined) ? null : value);
  }
};

update.backLog = function() {
  var extract = jira.getBacklog();
  var issues = extract.issues;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.backlog);
  var origin = sheet.getRange('C2');
  
  var nb_rows = sheet.getMaxRows() - origin.getRow();
  
  if (nb_rows > 0)
    sheet.deleteRows(origin.getRow(), nb_rows);
  sheet.getRange('2:2').clearContent();
  
  sheet.insertRows(origin.getRow(), issues.length);
  
  var row = 0;
  var fields = jira.readExportFields();

  var note = Utilities.formatDate(new Date(), 'GMT+1', "'data refreshed ' yyyy-MM-dd 'at' HH:mm:ss");
  origin.offset(-1,0).setNote(note);
  
  issues.forEach(function (issue) {
    var col = 0;
    
    for (var key in fields)
      if (fields[key].fn != null) {
        var value = fields[key].fn(issue, fields[key].tech);
        origin.offset(row, col++).setValue((value == undefined) ? null : value);
      }

    row++;
  });
};


update.completeStatuses = function() {
  var global = {};
  var statuses = {};

  {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('#STATUSES');
    var values = sheet.getRange(1,1,sheet.getMaxRows(),sheet.getMaxColumns()).getValues();

    var tmp = {};
    for (var i = 1; i < values.length && values[i][0] != ''; i++) {
      var id = values[i][0].split('.')[0];
      tmp[id] = values[i][0];
    }
    
    for (var i = 1; i < values.length && values[i][1] != ''; i++) {
      var id = values[i][1].split('.')[0];
      global[values[i][1]] = tmp[id];
    }
  }
  
  {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('#JIRA_STATUSES');
    var values = sheet.getRange(1,1,sheet.getMaxRows(),sheet.getMaxColumns()).getValues();

    for (var i = 0; i < values.length && values[i][0] != ''; i++) {
      statuses[values[i][0]] = {
        'generic': values[i][1],
        'global': global[values[i][1]]
      }
    }
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.backlog);
  var values = sheet.getRange(1,5,sheet.getMaxRows(),1).getValues();

  var results = [];
  for (var i = 1; i < values.length; i++) {
    var status = statuses[values[i]];

    results.push((status === undefined) ? ['', ''] : [status.generic, status.global]);
  }
  
  sheet.getRange(2,1,sheet.getMaxRows()-1,2).setValues(results);
};


update.archiveLines = function() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.daily);
  var origin = sheet.getRange('A3');
  
  var now = new Date();
  var now_str = Utilities.formatDate(now, 'GMT', 'yyyy-MM-dd');

  var then = origin.offset(0,0).getValue();
  var then_str = Utilities.formatDate(then, 'GMT', 'yyyy-MM-dd');

  if (now_str != then_str) {
    var row = origin.getRow();

    sheet.insertRowBefore(row+1);
    sheet.getRange(row + ':' + row).copyTo(origin.offset(1,0), {contentsOnly:true});
  }  
};


update.dailyLine = function(date) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.daily);
  var origin = sheet.getRange('A3');
  
  var now = date || new Date();
  var now_str = Utilities.formatDate(now, 'GMT', 'yyyy-MM-dd');

  origin.offset(0,0).setValue(now);
  
  for (var c = 1; c < sheet.getMaxColumns(); c++) // FORCE UPDATE
    origin.offset(0,c).setFormula(origin.offset(0,c).getFormula());

  var now_sprint = origin.offset(0,1).getValue();

  update.sprintLine();
};



update.sprintLine = function() {
  var daily_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.daily);
  var sprint_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.sprint);

  var daily_origin = daily_sheet.getRange('A3');
  var sprint_origin = sprint_sheet.getRange('A3');
  
  var daily_sprint = daily_origin.offset(0,1).getValue();
  var sprint_sprint = sprint_origin.offset(0,2).getValue();

  if (daily_sprint != sprint_sprint) {
    var row = sprint_origin.getRow();

    sprint_sheet.insertRowBefore(row+1);
    sprint_sheet.getRange(row + ':' + row).copyTo(sprint_origin.offset(1,0), {contentsOnly:true});
    
    sprint_origin.offset(0,0).setValue(new Date());
  }

  {
    var row = daily_origin.getRow();

    daily_sheet.getRange(row + ':' + row).copyTo(sprint_origin.offset(0,1), {contentsOnly:true});
  }
};


update.sprintHistory = function() {
  var daily_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.daily);
  var sprint_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.sprint);

  var daily_origin = daily_sheet.getRange('A3');
  var daily_sprint = daily_origin.offset(0,1).getValue();

  var row = sprint_sheet.getMaxRows();

  var sprint_formula = daily_origin.offset(0,1).getFormula();
  var max_sprint = sprint_sheet.getRange(row-1,3).getValue()-1;
  
  try {
    for (var sprint = max_sprint; sprint > 0; sprint--) {
      sprint_sheet.insertRowBefore(row);
      var origin = sprint_sheet.getRange(row, 1);
      
      daily_origin.offset(0,1).setValue(sprint);
      for (var c = 2; c < daily_sheet.getMaxColumns(); c++) // FORCE UPDATE
        daily_origin.offset(0,c).setFormula(daily_origin.offset(0,c).getFormula());
      
      daily_sheet.getRange('3:3').copyTo(sprint_sheet.getRange('B' + row), {contentsOnly:true});
      
      row++;
    }
  } catch (e) {};
  
  daily_origin.offset(0,1).setFormula(sprint_formula);
};


/* POST ACTIONS **********************************/

update.configurationFromUpload = function(config) {
  var properties = PropertiesService.getUserProperties();
  var properties = PropertiesService.getScriptProperties();
  
  properties.setProperty('protocol', config.protocol);
  properties.setProperty('hostname', config.hostname);

  properties.setProperty('auth_user', config.auth_user);
  properties.setProperty('auth_pass', config.auth_pass);
  properties.setProperty('auth_token', config.auth_token);
  
  properties.setProperty('project', config.project);
  properties.setProperty('fields', config.fields);
}

update.backLogFromUpload = function(date, contents) {
  update.archiveLines();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheets.backlog);
  var origin = sheet.getRange('C2');
  
  var nb_rows = sheet.getMaxRows() - origin.getRow();
  
  if (nb_rows > 0)
    sheet.deleteRows(origin.getRow(), nb_rows);
  sheet.getRange('2:2').clearContent();
  
  sheet.insertRows(origin.getRow(), contents.length);
  
  var row = 0;
  origin.offset(-1,0).setNote('data refreshed ' + date);
  origin.offset(0, 0, contents.length, contents[0].length).setValues(contents);
  
  update.completeStatuses();
  update.dailyLine(new Date(date.replace(/\./g,'/')));
};