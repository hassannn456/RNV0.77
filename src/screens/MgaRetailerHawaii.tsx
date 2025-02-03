// cSpell:ignore Kele, Servco, Pukoloa, Kaimuki, Waialae, Hilo, Keaa, Lihue
import React from 'react'
import { useTranslation } from 'react-i18next'
import { testID } from '../components/utils/testID'
import CsfAccordionList from '../components/CsfAccordionList'
import CsfAccordionSection from '../components/CsfAccordionSection'
import { MgaPhoneNumber } from '../components/CsfPhoneNumber'
import CsfView from '../components/CsfView'
import MgaAddress from '../components/MgaAddress'
import MgaButton from '../components/MgaButton'
import MgaPage from '../components/MgaPage'
import mgaOpenURL from '../components/utils/linking'

const MgaRetailerHawaii: React.FC = () => {
  const { t } = useTranslation()

  const id = testID('RetailerHawaii')
  return (
    <MgaPage title={t('branding:myRetailer')} showVehicleInfoBar>
      <CsfView p={16} testID={id()}>
        <CsfAccordionList testID={id('list')}>
          <CsfAccordionSection
            title="Big Island"
            testID={id('BigIsland')}
            renderBody={() => (
              <CsfView p={16} gap={16}>
                <MgaAddress
                  address="Big Island Motors – Hilo"
                  address2="1Keaa St."
                  city="Hilo"
                  state="HI"
                  zip="96720"
                  testID={id('retailerAddressHilo')}
                />

                <MgaPhoneNumber
                  trackingId="RetailerPhoneButtonHilo"
                  variant="secondary"
                  icon="Phone"
                  title={t('common:contactRetailer')}
                  phone={'8089614411'}
                />
                <MgaButton
                  trackingId="RetailerWebsiteButtonHilo"
                  variant="link"
                  onPress={() => mgaOpenURL('http://www.bigislandmotors.com')}
                  title={t('common:retailerWebsite')}
                />
              </CsfView>
            )}
          />
          <CsfAccordionSection
            title="Kauai"
            testID={id('Kauai')}
            renderBody={() => (
              <CsfView p={16} gap={16}>
                <MgaAddress
                  address="Servco Subaru Kauai – Sales"
                  address2="4337 Rice St."
                  city="Lihue"
                  state="HI"
                  zip="HI"
                  testID={id('retailerAddressLihue')}
                />

                <MgaPhoneNumber
                  trackingId="RetailerPhoneButtonLihue"
                  variant="secondary"
                  icon="Phone"
                  title={t('common:contactRetailer')}
                  phone={'8082456978'}
                />
                <MgaButton
                  trackingId="RetailerWebsiteButtonLihue"
                  variant="link"
                  onPress={() => mgaOpenURL('http://www.servcosubaru.com')}
                  title={t('common:retailerWebsite')}
                />
              </CsfView>
            )}
          />
          <CsfAccordionSection
            title="Maui"
            testID={id('Maui')}
            renderBody={() => (
              <CsfView p={16} gap={16}>
                <MgaAddress
                  address="Servco Subaru Maui"
                  address2="445 Kele St."
                  city="Kahului"
                  state="HI"
                  zip="96732"
                  testID={id('retailerAddressKahului')}
                />

                <MgaPhoneNumber
                  trackingId="RetailerPhoneButtonKahului"
                  variant="secondary"
                  icon="Phone"
                  title={t('common:contactRetailer')}
                  phone={'8088770031'}
                />
                <MgaButton
                  trackingId="RetailerWebsiteButtonKahului"
                  variant="link"
                  onPress={() => mgaOpenURL('http://www.servcosubaru.com')}
                  title={t('common:retailerWebsite')}
                />
              </CsfView>
            )}
          />
          <CsfAccordionSection
            title="Oahu"
            testID={id('Oahu')}
            renderBody={() => (
              <CsfView p={16} gap={16}>
                <MgaAddress
                  address="Servco Subaru Honolulu"
                  address2="2850 Pukoloa Street, Ste. 104"
                  city="Honolulu"
                  state="HI"
                  zip="96819"
                  testID={id('retailerAddressHonolulu')}
                />

                <MgaPhoneNumber
                  trackingId="RetailerPhoneButtonHonolulu"
                  variant="secondary"
                  icon="Phone"
                  title={t('common:contactRetailer')}
                  phone={'8086877600'}
                />
                <MgaButton
                  trackingId="RetailerWebsiteButtonHonolulu"
                  variant="link"
                  onPress={() => mgaOpenURL('http://www.servcosubaru.com')}
                  title={t('common:retailerWebsite')}
                />

                <MgaAddress
                  address="Servco Subaru Kaimuki"
                  address2="3361 Waialae Ave."
                  city="Honolulu"
                  state="HI"
                  zip="96816"
                  testID={id('retailerAddressKaimuki')}
                />

                <MgaPhoneNumber
                  trackingId="RetailerPhoneButtonKaimuki"
                  variant="secondary"
                  icon="Phone"
                  title={t('common:contactRetailer')}
                  phone={'8086877620'}
                />
                <MgaButton
                  trackingId="RetailerWebsiteButtonKaimuki"
                  variant="link"
                  onPress={() => mgaOpenURL('http://www.servcosubaru.com')}
                  title={t('common:retailerWebsite')}
                />
              </CsfView>
            )}
          />
        </CsfAccordionList>
      </CsfView>
    </MgaPage>
  )
}

export default MgaRetailerHawaii
