var dialogs = {};

dialogs.openModalDialog = function(name) {
  var html = HtmlService.createHtmlOutputFromFile(name)
  .setWidth(600)
  .setHeight(600);
  
  SpreadsheetApp.getUi()
  .showModalDialog(html, ' ');
};


/* CONFIGURATION DIALOG ***************************************/

function openConfigurationDialog() {
  dialogs.openModalDialog('dialogConfiguration');
};

function configGetAccess() {
  return api.readAccess();
};

function configSetAccess(url, user, pass) {
  return api.saveAccess(url, user, pass);
};

function configGetProjects() {
  return jira.getProjects();
};

function configGetCurrentProject() {
  return jira.readProject();
};

function configSetCurrentProject(project) {
  return jira.saveProject(project);
};

function configGetMinFields() {
  var fields = jira.readExportFields();
  return JSON.stringify(fields);
};

function configGetAllFields() {
  return jira.getFields();
};

function configSetExportFields(fields) {
  Logger.log(fields);
  jira.saveExportFields(fields);
  update.sheetColumns();
};

function configFinish() {
};