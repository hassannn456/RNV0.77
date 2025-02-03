/* eslint-disable eol-last */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MobileCore, Event } from '@adobe/react-native-aepcore';
import { Edge } from '@adobe/react-native-aepedge';
import { errorNotice, infoNotice, successNotice } from '../../components/notice';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfCard from '../../components/CsfCard';
import MgaButton from '../../components/MgaButton';
import CsfButton from '../../components/CsfButton';


const DevAdobeTracking: React.FC = () => {
  const { t } = useTranslation();
  /* 
    AEP Edge Module methods. It is recommended to use Edge methods instead of Core.
    https://github.com/adobe/aepsdk-react-native/tree/main/packages/edgebridge
  */

  function getLocationHint() {
    Edge.getLocationHint()
      .then((hint: any) => {
        let locationStr = String(hint);
        if (hint == null) {
          locationStr = 'null';
        }
        successNotice({
          title: '`getLocationHint` resolved',
          subtitle: `Response: ${locationStr}`,
        });
      })
      .catch((error: Error) => {
        const subtitle: string = error.toString();
        errorNotice({
          title: '`getLocationHint` failed',
          subtitle: `Error: ${subtitle}`,
        });
      });
  }

  /* AEP Core methods */

  function trackAction(
    action?: string,
    contextData?: Record<string, string>,
  ): void {
    MobileCore.trackAction(action, contextData);
  }

  function trackState(
    state?: string,
    contextData?: Record<string, string>,
  ): void {
    MobileCore.trackState(state, contextData);
  }
  function collectPii(key: string, value: string): void {
    const piiPayload: { [key: string]: string } = {};
    piiPayload[key] = value;
    MobileCore.collectPii(piiPayload);
  }

  function dispatchEvent(
    eventName: string,
    eventType: string,
    eventSource: string,
  ): void {
    const event: Event = new Event(eventName, eventType, eventSource, {
      testKey: 'testValue',
    });
    MobileCore.dispatchEvent(event)
      .then((responseEvent: any) =>
        successNotice({
          title: '`dispatchEvent` resolved',
          subtitle: `Response: ${JSON.stringify(responseEvent)}`,
        }),
      )
      .catch((error: Error) => {
        errorNotice({
          title: '`dispatchEvent` failed',
          subtitle: `Error: ${JSON.stringify(error)}`,
        });
      });
  }

  function dispatchEventWithResponseCallback(
    eventName: string,
    eventType: string,
    eventSource: string,
  ): void {
    const event: Event = new Event(eventName, eventType, eventSource, {
      testKey: 'testValue',
    });
    MobileCore.dispatchEventWithResponseCallback(event)
      .then((responseEvent: any) =>
        successNotice({
          title: '`dispatchEventWithResponseCallback` resolved',
          subtitle: `Response: ${JSON.stringify(responseEvent)}`,
        }),
      )
      .catch((error: Error) => {
        errorNotice({
          title: '`dispatchEventWithResponseCallback` failed',
          subtitle: `Error: ${JSON.stringify(error)}`,
        });
      });
  }

  return (
    <MgaPage
      title={t('internalDevelopment:adobeTracking')}
      trackingId={'dev-controls'}
      bg="background">
      <CsfView p={16} gap={16}>
        <CsfCard title="Edge Methods" gap={16}>
          {/* `Edge: sendEvent` */}
          <MgaButton
            title="sendEvent"
            trackingId={'test-tracking-id'}
            onPress={() => {
              console.log('pressed');
            }}
          />

          {/* `Edge: getLocationHint` */}
          <CsfButton
            title="getLocationHint"
            onPress={() => {
              getLocationHint();
              infoNotice({
                title: '`getLocationHint` called',
              });
            }}
          />
        </CsfCard>

        <CsfCard title="Core Methods" gap={16}>
          {/* `trackAction` */}
          <CsfButton
            title="trackAction"
            onPress={() => {
              trackAction('loginClicked', {
                testKey: 'testValue',
                evar61: 'Mobile',
              });
              infoNotice({
                title: '`trackAction` called',
              });
            }}
          />

          {/* `trackState` */}
          <CsfButton
            title="trackState"
            onPress={() => {
              trackState('nested/state/path/uniqueID', {
                'entity.name': 'Test Name',
                'entity.id': '12345',
                'entity.view.id': '1',
              });
              infoNotice({
                title: '`trackState` called',
              });
            }}
          />

          {/* `collectPii` */}
          <CsfButton
            title="collectPii"
            onPress={() => {
              collectPii('myPii', 'testData');
              infoNotice({
                title: '`collectPii` called',
              });
            }}
          />

          {/* `dispatchEvent` */}
          <CsfButton
            title="dispatchEvent"
            onPress={() => {
              dispatchEvent('testEventName', 'testEventData', 'testEventSource');
              infoNotice({
                title: '`dispatchEvent` called',
              });
            }}
          />

          {/* `dispatchEventWithResponseCallback` */}
          <CsfButton
            title="dispatchEventWithResponseCallback"
            onPress={() => {
              dispatchEventWithResponseCallback(
                'testEventName',
                'testEventData',
                'testEventSource',
              );
              infoNotice({
                title: '`dispatchEventWithResponseCallback` called',
              });
            }}
          />
        </CsfCard>
      </CsfView>
    </MgaPage>
  );
};

export default DevAdobeTracking;