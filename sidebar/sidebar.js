/*
  sidebar.js
  - must be loaded via <script> to have access to sidebar's DOM

  - content specific to test cases
*/

var sidebar = {
  id:null,
  title:null,
  url:null
}
sidebar.ping = function( sender = null ){
  console.log('sidebar.ping() from:', sender)
}


/* Update the sidebar's content.
1. display tab title in sidebar
2. if tab content from youtube.com, display tab.url for downloading
3. get youtube data
*/
function updateHeader( tab ){
  console.log('sidebar.updateHeader()')

}
function updateContent() {
  browser.tabs.query({windowId: sidebar.id, active: true})
    .then((tabs) => {

      sidebar.title.value = tabs[0].title
      let url = tabs[0].url
      if(url.indexOf('https://www.youtube.com') !== 0){
        url = ''
      }
      sidebar.url.value = url
      //not accessible:
      //  videoDl.ping('sidebar')

      //return browser.storage.local.get(tabs[0].url);
      updateHeader( tabs[0] )
    })
    // .then((storedInfo) => {
    //   //contentBox.textContent = storedInfo[Object.keys(storedInfo)[0]];
    // });
}

//test calling background message handler
sidebar.btnReloadClick= function(event){
  console.log('sidebar.btnReloadClick()', event)

  browser.runtime.sendMessage({
    sender:'sidebar.btnReloadClick',
    to: 'ui',
    type: 'ping',
    data:' sent from sidebar.btnReloadClick()'
  });
}

//sidebar.init = function(){
//browser.windows.getCurrent({populate: true}).then((windowInfo) => {
window.addEventListener('DOMContentLoaded', (event) => {

  //get the ID of its window
  //sidebar.id = windowInfo.id;
  sidebar.title = document.querySelector("#fld-title")
  sidebar.url = document.querySelector("#fld-url")

  browser.commands.onCommand.addListener(function (command) {
    if (command === "toggle-feature") {
      console.log("Toggle sidebar visibility");
    	browser.sidebarAction.toggle()
    }
  });

  //ping tests
  document.querySelector('#btnPingBackground').addEventListener('click', function(event){
      console.log('sidebar.btnPingBackground()', event)
      browser.runtime.sendMessage({
        sender:'sidebar.btnPingBackground',
        to: 'background',
        type: 'ping'
      });
  })
  document.querySelector('#btnPingSidebar').addEventListener('click', function(event){ 
    //cannot message self; must call sidebar.ping via background.sidebar-ping
    console.log('sidebar.btnPingSidebar()', event)
    browser.runtime.sendMessage({
      sender:'sidebar.btnPingSidebar',
      to: 'background',
      type: 'sidebar-ping'
    });
  })
  //connection-based messaging with content script
  document.querySelector('#btnPingContent').addEventListener('click', async function(event){
    console.log('sidebar.btnPingContent()')
    //works 
    portFromCS.postMessage({ greeting:"Ping from sidebar" });
  })
  


  //test calling native batch file
  let btn = document.querySelector('#btNativeBat')
  btn.addEventListener('click', function(event){
    console.log('sidebar.btNativeBat()', event)

    browser.runtime.sendMessage({
      sender:'sidebar.btNativeBat',
      to: 'ui',
      type: 'nativeBat',
      data:' sent from sidebar.btNativeBat()'
    });
  })

  //test calling native app
  btn = document.querySelector('#btNativeApp')
  btn.addEventListener('click', function(event){
    console.log('sidebar.btNativeApp()', event)

    browser.runtime.sendMessage({
      sender:'sidebar.btNativeApp',
      to: 'ui',
      type: 'nativeApp',
      data:' sent from sidebar.btNativeApp()'
    });
  })

  //test calling background message handler
  btn = document.querySelector('#btnReload')
  btn.addEventListener('click', function(event){
    sidebar.btnReloadClick(event)
  })

  //test basic message passing
  browser.runtime.onMessage.addListener( function( message ){
    if(message.handler || message.to !== 'sidebar')
      return

    switch (message.type) {
      case 'ping':
        message.handler = 'sidebar'
        console.log(`sidebar.ping called from `, message.sender)
        browser.notifications.create({
          "type": "basic",
          "iconUrl": browser.extension.getURL("link.png"),
          "title": "sidebar.js "+message.type,
          "message": 'from: '+message.sender
        });  
        break
    }

    if(message.handler){
      // message.handled = ui.calc.timeStamp()
    }

  })

  browser.runtime.sendMessage({
    sender:'sidebar',
    to: 'ui',
    type: 'ping',
    data:' sent from sidebar'
  });

  // //Update content when a new tab becomes active.
  // browser.tabs.onActivated.addListener(updateContent);
  // //Update content when a new page is loaded into a tab.
  // browser.tabs.onUpdated.addListener(updateContent);
  // //update content when the sidebar loads
  updateContent();

  console.log('sidebar initted.')
})


//fails:
//import { getUsefulContents } from '../lib/module.js';


//connection-based messaging with content script
var portFromCS;
function connected(p) {
  console.log('sidebar connected', p)
  portFromCS = p;
}
browser.runtime.onConnect.addListener(connected);

console.log(`sidebar.init`)