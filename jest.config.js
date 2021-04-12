module.exports = {
  roots: ['src'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  transformIgnorePatterns: ['node_modules/(?!(react-native|comlinkjs)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
