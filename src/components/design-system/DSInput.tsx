import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleSheet
} from 'react-native';
import { X } from 'lucide-react-native';
import { Tokens, PrimitivePalette } from '../../theme';

export interface DSInputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  clearable?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const DSInput: React.FC<DSInputProps> = ({
  label,
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  clearable = false,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  const hasError = Boolean(errorText);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          hasError && styles.errorContainer
        ]}
      >
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={PrimitivePalette.gray400}
          onFocus={e => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          style={[styles.input, inputStyle]}
          {...rest}
        />

        {clearable && Boolean(value) && (
          <Pressable
            onPress={handleClear}
            hitSlop={Tokens.layout.touchHitSlop}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
          >
            <X size={16} color={PrimitivePalette.gray400} />
          </Pressable>
        )}

        {trailingIcon && !clearable && (
          <View style={styles.trailingIcon}>{trailingIcon}</View>
        )}
      </View>

      {hasError ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Tokens.spacing[3]
  },
  label: {
    fontFamily: Tokens.fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: PrimitivePalette.zinc800,
    marginBottom: Tokens.spacing[1]
  },
  inputContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PrimitivePalette.white,
    borderWidth: 1,
    borderColor: PrimitivePalette.borderLight,
    borderRadius: Tokens.radii.xl,
    borderCurve: 'continuous',
    paddingHorizontal: Tokens.spacing[3]
  },
  focusedContainer: {
    borderColor: PrimitivePalette.zinc900,
    backgroundColor: PrimitivePalette.white
  },
  errorContainer: {
    borderColor: PrimitivePalette.crimson,
    backgroundColor: PrimitivePalette.crimsonSubtle
  },
  leadingIcon: {
    marginRight: Tokens.spacing[2],
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Tokens.fonts.sansRegular,
    fontSize: 14.5,
    color: PrimitivePalette.zinc900
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PrimitivePalette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Tokens.spacing[1]
  },
  trailingIcon: {
    marginLeft: Tokens.spacing[2],
    alignItems: 'center',
    justifyContent: 'center'
  },
  helperText: {
    fontFamily: Tokens.fonts.sansRegular,
    fontSize: 11.5,
    lineHeight: 16,
    color: PrimitivePalette.gray500,
    marginTop: Tokens.spacing[1]
  },
  errorText: {
    fontFamily: Tokens.fonts.sansMedium,
    fontSize: 11.5,
    lineHeight: 16,
    color: PrimitivePalette.crimson,
    marginTop: Tokens.spacing[1]
  }
});
