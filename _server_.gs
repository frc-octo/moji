var UPLOAD_KEY = '3ea6c275f20b7ad06dc077d18d250a8b';

function doGet(e) {
  return ContentService.createTextOutput('null').setMimeType(ContentService.MimeType.JSON); 
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var result = '';

  try {
    if (body.key == UPLOAD_KEY) {
      switch (body.action) {
        case 'configure':
          var config = body.arguments;

          update.configurationFromUpload(config);
          result = 'configure done';
          break;
          
        case 'update':
          var date = body.arguments.date;
          var contents = body.arguments.contents;
          
          update.backLogFromUpload(date, contents);
          result = 'update done';
          break;
          
        default:;
      }
    }
  } catch (e) {
    result = e.message;
  }
  
  return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.TEXT);
}

function myFunction() {
  Logger.log(new Date("2017.01.31".replaceAll('.','/')));
  return;
  var service = ScriptApp.getService();
  
  //service.enable();
  Logger.log(service.isEnabled());
  Logger.log(service.getUrl());
  //service.disable();
}
