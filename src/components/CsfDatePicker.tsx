import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { SharedTextInputProps } from './CsfTextInput';
import {
  formatFullDate,
  formatShortTime,
  formatFullDateTime,
} from '../utils/dates';
import CsfPressable from './CsfPressable';

export interface CsfDatePickerProps extends SharedTextInputProps {
  mode?: 'date' | 'time' | 'datetime';
  date?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChangeDate?: (date: Date) => void;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
}

const CsfDatePicker: React.FC<CsfDatePickerProps> = props => {
  const {
    mode = 'date',
    date,
    onChangeDate,
    minuteInterval,
    minimumDate,
    maximumDate,
    ...inputProps
  } = props;

  const [open, setOpen] = useState(false);

  const value = date
    ? mode === 'date'
      ? formatFullDate(date)
      : mode === 'time'
        ? formatShortTime(date)
        : formatFullDateTime(date)
    : undefined;

  return (
    <View style={inputProps.style}>
      <CsfPressable onPress={() => setOpen(true)}>
        {/* <CsfInput
          interactionEnabled={false}
          pointerEvents="none"
          value={value}
          {...inputProps}
        /> */}
      </CsfPressable>
      <DatePicker
        minuteInterval={minuteInterval}
        modal
        mode={mode}
        open={open}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        date={date ?? new Date()}
        onConfirm={date => {
          if (onChangeDate) {
            onChangeDate(date);
          }
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
};

// Default export for CsfDatePicker
export default CsfDatePicker;
