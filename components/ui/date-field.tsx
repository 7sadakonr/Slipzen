import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { format } from 'date-fns';
import { makeStyles, radius, typography, useTheme } from '../../theme';

let Host: any, SwiftUIDatePicker: any, datePickerStyle: any, labelsHidden: any;
if (Platform.OS === 'ios') {
  try {
    const ui = require('@expo/ui/swift-ui');
    const modifiers = require('@expo/ui/swift-ui/modifiers');
    Host = ui.Host;
    SwiftUIDatePicker = ui.DatePicker;
    datePickerStyle = modifiers.datePickerStyle;
    labelsHidden = modifiers.labelsHidden;
  } catch {
    // falls back to a text field below
  }
}

interface DateFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  /** Latest selectable date (defaults to today). */
  maxDate?: Date;
  error?: string;
  /** Small note under the field, e.g. a warning about an unusual date. */
  hint?: string;
}

/** Native date picker on iOS, YYYY-MM-DD text field elsewhere. */
export function DateField({ label = 'Date', value, onChange, maxDate = new Date(), error, hint }: DateFieldProps) {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const [text, setText] = React.useState(format(value, 'yyyy-MM-dd'));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, !!error && { borderColor: colors.danger }]}>
        {Host && SwiftUIDatePicker && datePickerStyle ? (
          // The label above is ours; hide SwiftUI's own so the date can't overflow the field.
          <Host matchContents colorScheme={isDark ? 'dark' : 'light'} style={styles.host}>
            <SwiftUIDatePicker
              title={label}
              selection={value}
              range={{ end: maxDate }}
              displayedComponents={['date']}
              onDateChange={onChange}
              modifiers={[datePickerStyle('compact'), ...(labelsHidden ? [labelsHidden()] : [])]}
            />
          </Host>
        ) : (
          <TextInput
            style={styles.input}
            value={text}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            onChangeText={(t) => {
              setText(t);
              const d = new Date(t);
              if (!isNaN(d.getTime())) onChange(d);
            }}
          />
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { marginBottom: 16 },
  label: {
    ...typography.footnote,
    color: c.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  host: { alignSelf: 'flex-start' },
  input: { fontSize: 16, color: c.textPrimary, minHeight: 52, alignSelf: 'stretch', paddingHorizontal: 6 },
  error: { color: c.danger, fontSize: 12, marginTop: 4 },
  hint: { color: c.textSecondary, fontSize: 12, marginTop: 4 },
}));
