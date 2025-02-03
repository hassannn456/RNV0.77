/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';
import CsfAppIcon from './CsfAppIcon';
import { FlatList } from 'react-native';
import CsfPressable from './CsfPressable';
import CsfModal from './CsfModal';
import { getEditable } from './utils/props';
import { testID } from './utils/testID';
import CsfButton from './CsfButton';
import CsfView from './CsfView';
import CsfRule from './CsfRule';
import { CsfTableViewCell } from './CsfTableViewCell';
import CsfText from './CsfText';

// TODO:UA:20231229: Re-do control to match MCL Page 11, Dropdown Fields

export interface CsfDropdownItem {
  label: string | undefined
  value: string | undefined
  /**
   * Custom view for list item.
   *
   * Not all controls using item lists support this.
   * Label is still required when supplying view.
   **/
  view?: () => JSX.Element
}

/** Properties for a dropdown. */
export interface CsfDropdownProps extends SharedTextInputProps {
  /** Array of dropdown items. */
  options?: CsfDropdownItem[]
  /** Event fired on item selection
   *
   * TODO:AG:20230602: Reuse input event hook here? */
  onSelect?: (item: string) => void
}

const CsfSelect: React.FC<CsfDropdownProps> = (
  props: CsfDropdownProps,
) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const { options, onSelect, ...inputProps } = props;
  const editable = getEditable(inputProps);
  const onPress = () => editable && setShow(!show);
  const cutoffForScrolling = 8;
  const extendedView = options?.length > cutoffForScrolling;
  const selectedIndex = options?.findIndex(
    option => option.value == inputProps.value,
  );
  const visibleOptions = search
    ? options?.filter(
      option => option.label?.toLowerCase()?.includes(search.toLowerCase()),
    )
    : options;

  const id = testID(props.testID);
  return (
    <>
      <CsfPressable onPress={onPress} testID={id()}>
        <CsfTextInput
          pointerEvents="none"
          interactionEnabled={false}
          trailingAccessory={
            <CsfAppIcon color={'button'} icon={'DrawerDownArrow'} size="xl" />
          }
          trailingAccessoryOnPress={onPress}
          {...inputProps}
          value={
            options
              ? options.find(option => option.value == inputProps.value)?.label
              : inputProps.value
          }
          errors={props.errors}
        />
      </CsfPressable>
      {show && options && (
        <CsfModal
          // modalOuterStyle={extendedView ? { padding: 0, } : {}}
          modalInnerStyle={
            extendedView ? { width: '100%', height: '100%' } : {}
          }
          title={props.label}
          trailingAccessoryView={
            <CsfButton
              variant="inlineLink"
              icon="Close"
              onPress={() => setShow(false)}
              testID={id('close')}
            />
          }>
          {extendedView && (
            <CsfView p={8}>
              <CsfTextInput
                testID={id('filter')}
                outsideLabel
                inputMode="search"
                returnKeyType="search"
                {...inputProps}
                label="Filter"
                value={search}
                onChangeText={setSearch}
              />
              <CsfRule />
            </CsfView>
          )}
          <FlatList
            data={visibleOptions}
            scrollEnabled={extendedView}
            renderItem={({ item, index }) => (
              <CsfTableViewCell
                key={item.value}
                testID={id(`item-${index}`)}
                onPress={() => {
                  onSelect && onSelect(item.value ?? '');
                  setShow(false);
                }}>
                <CsfText>{item.label}</CsfText>
                {selectedIndex == index && (
                  <CsfAppIcon
                    icon="Success"
                    color="success"
                    testID={id('checkmark-icon')}
                  />
                )}
              </CsfTableViewCell>
            )}
          />
        </CsfModal>
      )}
    </>
  );
};


export default CsfSelect;