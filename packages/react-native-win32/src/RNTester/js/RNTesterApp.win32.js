/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const RNTesterActions = require('./utils/RNTesterActions');
const RNTesterExampleContainer = require('./components/RNTesterExampleContainer');
const RNTesterExampleList = require('./components/RNTesterExampleList');
const RNTesterList = require('./utils/RNTesterList'); // [Win32] Remove .ios
const RNTesterNavigationReducer = require('./utils/RNTesterNavigationReducer');
const React = require('react');
// const SnapshotViewIOS = require('./examples/Snapshot/SnapshotViewIOS.ios'); [Win32]
// const URIActionMap = require('./utils/URIActionMap'); [Win32]

const {
  AppRegistry,
  // AsyncStorage, [Win32]
  // BackHandler, [Win32]
  Button,
  // Linking, [Win32]
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  LogBox,
} = require('react-native');

import type {RNTesterExample} from './types/RNTesterTypes';
import type {RNTesterAction} from './utils/RNTesterActions';
import type {RNTesterNavigationState} from './utils/RNTesterNavigationReducer';
import {RNTesterThemeContext, themes} from './components/RNTesterTheme';
import type {ColorSchemeName} from '../../Libraries/Utilities/NativeAppearance';

type Props = {exampleFromAppetizeParams?: ?string, ...};

LogBox.ignoreLogs(['Module RCTImagePickerManager requires main queue setup']);

// const APP_STATE_KEY = 'RNTesterAppState.v2'; [Win32]

const MessageQueue = require('react-native/Libraries/BatchedBridge/MessageQueue');
MessageQueue.spy(true);

const Header = ({
  onBack,
  title,
}: {
  onBack?: () => mixed,
  title: string,
  ...
}) => (
  <RNTesterThemeContext.Consumer>
    {theme => {
      return (
        <SafeAreaView
          style={[
            styles.headerContainer,
            {
              borderBottomColor: theme.SeparatorColor,
              backgroundColor: theme.TertiarySystemBackgroundColor,
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.headerCenter}>
              <Text style={{...styles.title, ...{color: theme.LabelColor}}}>
                {title}
              </Text>
            </View>
            {onBack && (
              <View>
                <Button
                  title="Back"
                  onPress={onBack}
                  color={Platform.select({
                    ios: theme.LinkColor,
                    default: undefined,
                  })}
                />
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }}
  </RNTesterThemeContext.Consumer>
);

const RNTesterExampleContainerViaHook = ({
  onBack,
  title,
  module,
}: {
  onBack?: () => mixed,
  title: string,
  module: RNTesterExample,
  ...
}) => {
  const colorScheme: ?ColorSchemeName = useColorScheme();
  const theme = colorScheme === 'dark' ? themes.dark : themes.light;
  return (
    <RNTesterThemeContext.Provider value={theme}>
      <View style={styles.exampleContainer}>
        <Header onBack={onBack} title={title} />
        <RNTesterExampleContainer module={module} />
      </View>
    </RNTesterThemeContext.Provider>
  );
};

const RNTesterExampleListViaHook = ({
  onNavigate,
  list,
}: {
  onNavigate?: () => mixed,
  list: {
    ComponentExamples: Array<RNTesterExample>,
    APIExamples: Array<RNTesterExample>,
    ...
  },
  ...
}) => {
  const colorScheme: ?ColorSchemeName = useColorScheme();
  const theme = colorScheme === 'dark' ? themes.dark : themes.light;
  return (
    <RNTesterThemeContext.Provider value={theme}>
      <View style={styles.exampleContainer}>
        <Header title="RNTester" />
        <RNTesterExampleList onNavigate={onNavigate} list={list} />
      </View>
    </RNTesterThemeContext.Provider>
  );
};

class RNTesterApp extends React.Component<Props, RNTesterNavigationState> {
  _mounted: boolean;

  UNSAFE_componentWillMount() {
    // [Win32 BackHandler not implemented
    // BackHandler.addEventListener('hardwareBackPress', this._handleBack);
    // Win32]
  }

  componentDidMount() {
    this._mounted = true;

    // [Win32 Rex doesn't provide AsyncStorage or Linking by default
    // Linking.getInitialURL().then(url => {
    //   // eslint-disable-next-line handle-callback-err
    //   AsyncStorage.getItem(APP_STATE_KEY, (err, storedString) => {
    //     if (!this._mounted) {
    //       return;
    //     }
    //     const exampleAction = URIActionMap(
    //       this.props.exampleFromAppetizeParams,
    //     );
    //     const urlAction = URIActionMap(url);
    //     const launchAction = exampleAction || urlAction;
    //     const initialAction = launchAction || {type: 'InitialAction'};
    //     this.setState(RNTesterNavigationReducer(undefined, initialAction));
    //   });
    // });

    // Linking.addEventListener('url', url => {
    //   this._handleAction(URIActionMap(url));
    // });

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(
      RNTesterNavigationReducer(undefined, {type: 'InitialAction'}),
    );
    // Win32]
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  _handleBack = () => {
    this._handleAction(RNTesterActions.Back());
  };

  _handleAction = (action: ?RNTesterAction) => {
    if (!action) {
      return;
    }
    const newState = RNTesterNavigationReducer(this.state, action);
    if (this.state !== newState) {
      this.setState(newState); // [Win32] Remove AsyncStorage usage
    }
  };

  render(): React.Node | null {
    if (!this.state) {
      return null;
    }
    if (this.state.openExample) {
      const Component = RNTesterList.Modules[this.state.openExample];
      if (Component && Component.external) {
        return <Component onExampleExit={this._handleBack} />;
      } else {
        return (
          <RNTesterExampleContainerViaHook
            onBack={this._handleBack}
            title={Component.title}
            module={Component}
          />
        );
      }
    }
    return (
      <RNTesterExampleListViaHook
        onNavigate={this._handleAction}
        list={RNTesterList}
      />
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    height: 40,
    flexDirection: 'row',
  },
  headerCenter: {
    flex: 1,
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  exampleContainer: {
    flex: 1,
  },
});
// [Win32
// AppRegistry.registerComponent('SetPropertiesExampleApp', () =>
//   require('./examples/SetPropertiesExample/SetPropertiesExampleApp'),
// );
// AppRegistry.registerComponent('RootViewSizeFlexibilityExampleApp', () =>
//   require('./examples/RootViewSizeFlexibilityExample/RootViewSizeFlexibilityExampleApp'),
// );
// Win32]

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

// [Win32
// // Register suitable examples for snapshot tests
// RNTesterList.ComponentExamples.concat(RNTesterList.APIExamples).forEach(
//   (Example: RNTesterExample) => {
//     const ExampleModule = Example.module;
//     if (ExampleModule.displayName) {
//       class Snapshotter extends React.Component<{...}> {
//         render() {
//           return (
//             <SnapshotViewIOS>
//               <RNTesterExampleContainer module={ExampleModule} />
//             </SnapshotViewIOS>
//           );
//         }
//       }

//       AppRegistry.registerComponent(
//         ExampleModule.displayName,
//         () => Snapshotter,
//       );
//     }
//   },
// );
// Win32]

module.exports = RNTesterApp;
