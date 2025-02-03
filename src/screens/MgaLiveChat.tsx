/* eslint-disable react-native/no-inline-styles */
import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useAppNavigation } from '../Controller';
import CsfActivityIndicator from '../components/CsfActivityIndicator';

// import revisionJson from '../../build/revision.json'
const MgaLiveChat: React.FC = () => {
  const webRef = useRef<WebView>(null);
  const navigation = useAppNavigation();

  const openChatWindow = () => {
    if (webRef.current) {
      webRef.current.injectJavaScript(
        `
        var liveChatInterval = setInterval(function () {
          var el = document.querySelector(".lpButton");
          var maximizeButton = document.querySelector(".lp_maximize");
          if (el && el?.click) {
            el.click();
          }
          if (maximizeButton && maximizeButton?.click) {
            maximizeButton.click();
          }
        }, 100);
        
        let minimizeButton;
        let endConversationButton;
        let clearHistoryOption1;
        let clearHistoryOption2;
        let clearHistoryConfirmButton;
        setTimeout(() => {
          clearInterval(liveChatInterval);
          minimizeButton = document.querySelector(".lp_minimize").addEventListener("click", unLoad);
          endConversationButton = document.querySelector(".lp_top_close_action").addEventListener("click", unLoad);
          clearHistoryOption1 = document.querySelector("[id='LP_ForgetMeAction_1']").addEventListener("click", getClearHistoryButtonId);
          clearHistoryOption2 = document.querySelector("[id='LP_ForgetMeAction_2']").addEventListener("click", getClearHistoryButtonId);
        }, 6000);

        function getClearHistoryButtonId() {
          clearHistoryConfirmButton = document.querySelector(".lp_confirm_button").addEventListener("click", unLoad);
        }
        
        function unLoad() {
          window.ReactNativeWebView.postMessage("exitBrowser");
        }
        void(0);
            `,
      );
    }
  };

  return (
    <WebView
      style={{
        alignSelf: 'stretch',
        alignItems: 'stretch',
        borderRadius: 8,
        overflow: 'hidden',
      }}
      onMessage={message => {
        if (message.nativeEvent.data == 'exitBrowser') { navigation.pop(); }
      }}
      originWhitelist={['*']}
      // source={{
      //   uri: `https://www.mysubaru.com/login.html?source=MGA-${revisionJson.version}`,
      // }}
      ref={webRef}
      onLoad={_ => {
        openChatWindow();
      }}
      renderLoading={() => <CsfActivityIndicator size={'large'} />}
      startInLoadingState={true}
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
    />
  );
};

export default MgaLiveChat;
