const odbc = require('odbc')

const createConnection = async () => {
  const trainingDbConnStr =
    'DSN=Seasoft Training; Directory=D:\\Seasoft\\cai_lib; Prefix=D:\\Seasoft_data\\Common Training\\mpd,D:\\Seasoft_data\\Training\\mpd; ViewDLL=D:\\Pxplus; LogFile=\\PXPODBC.LOG; RemotePVKIOHost=10.0.0.253; SERVER=NotTheServer'

  const liveDbConnStr =
    'DSN=Seasoft EFI; Directory=D:\\Seasoft\\cai_lib; Prefix=D:\\Seasoft_data\\Common\\mpd,D:\\Seasoft_data\\Eastern\\mpd; ViewDLL=D:\\Pxplus; LogFile=\\PXPODBC.LOG; RemotePVKIOHost=10.0.0.253; Compression=1; CacheSize=1024; DirtyReads=1; EnforceDouble=1; EnforceNULLDate=1; StripTrailingSpaces=1; ReadOnly=1; SERVER=NotTheServer'

  const connection = await odbc.connect(liveDbConnStr)
  return connection
}

module.exports.createConnection = createConnection
