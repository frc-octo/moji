var global = {};

function onOpen() {
  SpreadsheetApp.getUi()
  .createMenu('Project Managment')
  .addItem('Configure spreadsheet', 'openConfigurationDialog')
  .addItem('Setup auto-update ', 'setupAutoUpdate')
  .addSubMenu(
    SpreadsheetApp.getUi().createMenu('Manual update')
    .addItem('0 – Archive statistics', 'archiveStatistics')
    .addItem('1 – Update backlog', 'updateBackLog')
    .addItem('2 – Match statuses', 'updateStatuses')
    .addItem('3 – Update statistics', 'updateStatistics')
    .addSeparator()
    .addItem('Global update', 'globalUpdate')
  )
  .addSeparator()
  .addSubMenu(
    SpreadsheetApp.getUi().createMenu('Other functions')
    .addItem('Refresh backlog columns', 'refreshColumns')
    .addItem('Compute history', 'computeHistory')
  )
  .addToUi();
}


function setupAutoUpdate() {
  utils.clearTriggers();
  utils.createUpdateTrigger();
  SpreadsheetApp.getUi().alert('Auto-update set up every day at 10pm.');
}

function globalUpdate() {
  update.archiveLines();
  update.backLog();
  update.completeStatuses();
  update.dailyLine();
}

function archiveStatistics() {
  update.archiveLines();
  SpreadsheetApp.getUi().alert('Statistics archived.');
}

function updateStatistics() {
  update.dailyLine();
  SpreadsheetApp.getUi().alert('Statistics updated.');
}

function updateBackLog() {
  update.backLog();
  SpreadsheetApp.getUi().alert('Backlog updated.');
}

function updateStatuses() {
  update.completeStatuses();
  SpreadsheetApp.getUi().alert('Statuses updated.');
}

function refreshColumns() {
  update.sheetColumns();
  SpreadsheetApp.getUi().alert('Columns refreshed.');
}

function computeHistory() {
  update.sprintHistory();
  SpreadsheetApp.getUi().alert('History computed.');
}