// Replace the variables in this block with real values.
var address = 'lamp.arus.cc:3306';
var user = 'testuser';
var userPwd = 'Aru5AcAd3my';
var db = 'ArusStudentManagement';
var dbUrl = 'jdbc:mysql://' + address + '/' + db;
var tableName = 'Biodata';
var biodataColumns = ["Fullname","SchoolCode", "SchoolName","IdentityCard"] //Change this to match the database name
var primaryKeyQuestion = "Email"
var primaryKeyColumnLoc = "Email"
var timestampLoc = "timestamp"

//identify columns name
function helper_fieldString() {
  var columnString = "("+ primaryKeyColumnLoc + ","+timestampLoc+","
  for (let i = 0; i < biodataColumns.length; i++) {
    columnString = columnString + biodataColumns[i] + ","
  }
  columnString = columnString.slice(0, -1) + ")"
  Logger.log(columnString)
  return columnString
}


//Create sql statement
function helper_makeStatement(){
  var columnString = helper_fieldString()
  var statement = 'INSERT INTO ' + tableName + " " + columnString + ' values (? , CONVERT_TZ(NOW(), \'+0:00\', \'+08:00\'),';
  for (let i = 0; i< biodataColumns.length;i++){ //This generates the necessary ? mark
    statement = statement + "?,"
  }
  
  statement = statement.slice(0, -1) + ")" //This removes the last , and add a bracket over it
  statement = statement + ' ON DUPLICATE KEY UPDATE ' + timestampLoc + ' = CONVERT_TZ(NOW(), \'+0:00\', \'+08:00\'),'
  for (let i = 0; i< biodataColumns.length;i++){ //This generates the necessary necessary COLUMN_NAME = ? 
    statement = statement + biodataColumns[i] + "= ?,"
  }
  statement = statement.slice(0, -1) //This removes the last , and add a bracket over it
  Logger.log(statement)
  
  return(statement)

}

function handleFormSubmit(event) {
  //test()
  Logger.log("FUNCTION FOR BIODATA")
  var conn = Jdbc.getConnection(dbUrl, user, userPwd);

  var email = ""
  
  var allData = [];
  var allQuestion = [];
  // console.log(JSON.stringify(event));
  var formResponse = event.response;
  var itemResponses = formResponse.getItemResponses();

  for (let i = 0; i < itemResponses.length; i++) {
    //Logger.log(itemResponses[i].getItem().getTitle())
    if (itemResponses[i].getItem().getTitle() == primaryKeyQuestion) {
      email = itemResponses[i].getResponse()
      //Logger.log("A")
    } else {
      allQuestion.push(itemResponses[i].getItem().getTitle())
      allData.push(itemResponses[i].getResponse())
    }

  }
  Logger.log(allData)
  Logger.log("Data to be sent to database is " + email + " and the data to be sent over is as follow: ");
  for (let i = 0; i < allData.length;i++){
    Logger.log(allQuestion[i] + ' : ' + allData[i])
  }
  var statement = helper_makeStatement()
  //var stmt = conn.prepareStatement('INSERT INTO ' + tableName + " " + columnString + ' values (? , CONVERT_TZ(NOW(), \'+0:00\', \'+08:00\') , ? , ?) ON DUPLICATE KEY UPDATE ' + timestampLoc + ' = CONVERT_TZ(NOW(), \'+0:00\', \'+08:00\'), ' + timestampLoc + ' = ?');
  var stmt = conn.prepareStatement(statement)
  var dataToBeFilled = []
  for (let i = 0; i< (biodataColumns.length * 2 + 1);i++){ // This generates the array to be filled into the ? 
    
    if(i == 0){ //This fills up the email
      dataToBeFilled.push(email)
      continue
    }
    //Logger.log(dataToBeFilled)
    if(i <= biodataColumns.length ){ //First half
      dataToBeFilled.push(allData[i-1])
      //Logger.log(dataToBeFilled)
    } else { //Second half
      dataToBeFilled.push(allData[i-3])
      Logger.log(dataToBeFilled)
    }
  }
  Logger.log(dataToBeFilled)
  for (let i = 0; i < dataToBeFilled.length; i++){
    stmt.setString(i+1,dataToBeFilled[i])
  }
  
  //Logger.log(result)
  try {
    var result = stmt.executeUpdate();
    if (result == 0) {
      throw "No cells is updated"
    } else if (result == 1) {
      Logger.log("New row inserted with email " + email)
    } else if (result == 2) {
      Logger.log("No new row added. Updated the record  for " + email);
    }
  } catch (e){
    Logger.log(e)
  }


}

//get form id
function getActiveFormID(){
  const id = FormApp.getActiveForm().getId();
  console.log(id);
}

//read form data (all)
function read(){

  var question = [];
  var answer = [];
  var form = FormApp.openById('1mdGvLH03R1rq65ATDCtTpsQo1o1WQEiWaOCZvbg_C3E');
  var formResponses = form.getResponses();
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();
    for (var j = 0; j < itemResponses.length; j++) {
      question.push(itemResponses[j].getItem().getTitle())
      answer.push(itemResponses[j].getResponse())
    }
  }
  Logger.log(question);
  Logger.log(answer);
  }


// function testSubmit(){
//   var conn = Jdbc.getConnection(dbUrl, user, userPwd);
//   Logger.log("Im here");
//   var query = "INSERT INTO Biodata (Email, timestamp, Name ,SchoolName) VALUES (\"lochiaching@hotmail.com\",\" CONVERT_TZ(NOW()\'+0:00\', \'+08:00\')\", \"Lo Chia Ching\", \"SMK TAMAN SEJAHTERA\");";
//   var stmt = conn.prepareStatement(query);
//   stmt.execute()
// }