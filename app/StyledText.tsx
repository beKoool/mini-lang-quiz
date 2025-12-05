import { Text as DefaultText, TextProps } from 'react-native';

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  
  return (
    <DefaultText
      style={[{ fontFamily: 'Inter_400Regular' }, style]}
      {...otherProps}
    />
  );
}