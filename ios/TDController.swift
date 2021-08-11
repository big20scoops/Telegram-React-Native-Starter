import Foundation

@objc(TDController)
class TDController: RCTEventEmitter {
  let EVENT = "TDLib"
  let CONTACT_EVENT = "TDContact"
  var client: TdClient? = TdClient()

  override func supportedEvents() -> [String]! {
    return [EVENT, CONTACT_EVENT]
  }
  
  func checkAuthenticationError(error: Dictionary<String, Any>) {
      if (error["@type"] as! String == "error") {
          client?.queryAsync(query:["@type":"getAuthorizationState"], f:updateAuthorizationState)
      }
  }
  
  @objc
  func sendPhoneNumber(_ phoneNumber: String) {
    client?.queryAsync(query:["@type":"setAuthenticationPhoneNumber", "phone_number":phoneNumber], f:checkAuthenticationError)
  }
  
  @objc
  func sendCode(_ code: String) {
    client?.queryAsync(query:["@type":"checkAuthenticationCode", "code":code], f:checkAuthenticationError)
  }
  
  @objc
  func sendPassword(_ password: String) {
    client?.queryAsync(query:["@type":"checkAuthenticationPassword", "password":password], f:checkAuthenticationError)
  }
  
  @objc
  func getContacts() {
    client?.queryAsync(query:["@type":"getContacts"], f:checkAuthenticationError)
  }

  @objc
  func downloadFile(_ id: NSNumber) {
    client?.queryAsync(query:["@type":"downloadFile", "file_id":id, "priority":32, "offset":0, "limit":0, "synchronous":false], f:checkAuthenticationError)
  }

  @objc
  func logOut() {
    client?.queryAsync(query:["@type":"logOut"], f:checkAuthenticationError)
  }

  @objc
  func startTDLib() {
    client = TdClient()
    // start the client by sending request to it
    client?.queryAsync(query: ["@type":"getOption", "name":"version"])
    
    client?.run {
        let update = $0
        if update["@type"] as! String == "updateAuthorizationState" {
          self.updateAuthorizationState(authorizationState: update["authorization_state"] as! Dictionary<String, Any>)

        } else if update["@type"] as! String == "users" {
          print("tdlibs: getContacts")
          self.sendEvent(withName: self.CONTACT_EVENT, body: ["contacts": update["user_ids"]])

        } else if update["@type"] as! String == "updateUser" {
          print("tdlibs: contactDetail")
          self.sendEvent(withName: self.CONTACT_EVENT, body: ["contact": update["user"]])
        } else if update["@type"] as! String == "updateFile" {
          print("tdlibs: updateFile")
          let fileInfo = update["file"] as? [String:AnyObject]
          let localInfo = fileInfo!["local"] as? [String:AnyObject]
          self.sendEvent(withName: self.CONTACT_EVENT, body: ["file": ["id": fileInfo!["id"], "path": localInfo!["path"]]])
        } else if update["@type"] as! String == "file" {
          print("tdlibs: file")
          let localInfo = update["local"] as? [String:AnyObject]
          self.sendEvent(withName: self.CONTACT_EVENT, body: ["file": ["id": update["id"], "path": localInfo!["path"]]])
        }
    }
  }

  @objc
  func initialTDLibs(_ apiId: NSNumber, apiHash: String, systemLangCode: String, deviceModel: String, systemVersion: String, appVersion: String) {
    print("tdlibs:", apiId, apiHash)
    let docPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
    client?.queryAsync(query:[
      "@type":"setTdlibParameters",
      "parameters":[
          "database_directory":docPath,
          "use_message_database":true,
          "use_secret_chats":true,
          "api_id":apiId,
          "api_hash":apiHash,
          "system_language_code":systemLangCode,
          "device_model":deviceModel,
          "system_version":systemVersion,
          "application_version":appVersion,
          "enable_storage_optimizer":true
      ]
    ]);
  }
  
  func updateAuthorizationState(authorizationState: Dictionary<String, Any>) {
      switch(authorizationState["@type"] as! String) {
          case "authorizationStateWaitTdlibParameters":
              print("tdlibs: TDlibParams")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateWaitTdlibParameters"])

          case "authorizationStateWaitEncryptionKey":
              print("tdlibs: checked")
              client?.queryAsync(query: ["@type":"checkDatabaseEncryptionKey", "encryption_key":""])

          case "authorizationStateWaitPhoneNumber":
              print("tdlibs: phone number")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateWaitPhoneNumber"])

          case "authorizationStateWaitCode":
              print("tdlibs: waiting for code")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateWaitCode"])

          case "authorizationStateWaitPassword":
              print("tdlibs: waiting for password")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateWaitPassword"])
            
          case "authorizationStateWaitRegistration":
              print("tdlibs: waiting for registration")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateWaitRegistration"])

          case "authorizationStateReady":
              print("tdlibs: ready")
              sendEvent(withName: EVENT, body: ["state": "authorizationStateReady"])

          case "authorizationStateLoggingOut":
              print("tdlibs: Logging out...")

          case "authorizationStateClosing":
              print("tdlibs: Closing...")

          case "authorizationStateClosed":
              sendEvent(withName: EVENT, body: ["state": "authorizationStateClosed"])
              print("tdlibs: Closed.")

          default:
              assert(false, "TODO: Unexpected authorization state");
      }
  }
}
