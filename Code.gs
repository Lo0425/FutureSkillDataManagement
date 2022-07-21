//DB parameters
var address = 'lamp.arus.cc:3306';
var user = 'testuser';
var userPwd = 'Aru5AcAd3my';
var db = 'ArusStudentManagement';
var dbUrl = 'jdbc:mysql://' + address + '/' + db;
var tableName = 'Biodata';
let info = SpreadsheetApp.getActiveSheet();
const data = info.getDataRange().getValues();

function readEmailFromSheet(){
  let EmailFromSheet=[]
  for(let i = 1; i<data.length; i++){
    const rowData = data[i];
    // Logger.log(rowData[1]);
    EmailFromSheet.push(rowData[1]);
  }
  // Logger.log(EmailFromSheet)
  return EmailFromSheet;

}

function readEmailFromDB(){
  var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  const stmt = conn.createStatement();
  // let result = stmt.execute('SELECT Email FROM ' + tableName)
  let EmailFromDB = [];
  let email = [];
  // Logger.log(result);
  let query = stmt.executeQuery('SELECT Email FROM ' + tableName);
  while(query.next()){
    EmailFromDB.push([
      query.getString(1)
    ])
  }
  query.close();
  stmt.close();
  conn.close();
  for(let i = 0; i<EmailFromDB.length; i++){
    // Logger.log(EmailFromDB[i][0])
    email.push(EmailFromDB[i][0])
  }
  return email;
}


function main(){
  let EmailFromSheet = readEmailFromSheet();
  let EmailFromDB = readEmailFromDB();
  var conn = Jdbc.getConnection(dbUrl, user, userPwd);
  let newData;
  // Logger.log(EmailFromSheet);
  // Logger.log(EmailFromDB);
  for(i of EmailFromSheet){
    // Logger.log(EmailFromDB.includes(i))
    if(!EmailFromDB.includes(i)){
      Logger.log(i);

      for(let j = 0; j<data.length; j++){
        if(data[j][1]==i){
          newData = data[j]
          const stmt = conn.prepareStatement('INSERT INTO ' + tableName+' values(?,CONVERT_TZ(NOW(), \'+0:00\', \'+08:00\'),?,?,?,?)');
          stmt.setString(1,newData[1])
          stmt.setString(2,newData[2])
          stmt.setString(3,newData[3])
          stmt.setString(4,newData[4])
          stmt.setString(5,newData[5])

          stmt.execute();
          stmt.close();
          conn.close();
        }
      } 
    }
  }
}
