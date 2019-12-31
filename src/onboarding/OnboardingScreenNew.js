import React, {
  Component
} from 'react';

import {
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {
  inject,
  observer
} from 'mobx-react/native'

import Wizard from '../common/components/Wizard';

import SuggestedChannelsStep from './steps/SuggestedChannelsStep';
import SuggestedGroupsStep from './steps/SuggestedGroupsStep';
import RewardsStep from './steps/RewardsStep';
import WelcomeStepNew from './steps/WelcomeStepNew';
import { CommonStyle as CS } from '../styles/Common';
import navigationService from '../navigation/NavigationService';
import i18nService from '../common/services/i18n.service';
import CenteredLoading from '../common/components/CenteredLoading';
import HashtagsStepNew from './steps/HashtagsStepNew';
import ChannelSetupStepNew from './steps/ChannelSetupStepNew';

@observer
@inject('onboarding', 'hashtag')
export default class OnboardingScreenNew extends Component {

  /**
   * Disable navigation bar
   */
  static navigationOptions = {
    header: null
  }

  onFinish = async () => {
    try {
      await this.props.onboarding.setShown(true);
      await this.props.onboarding.getProgress();
      this.props.hashtag.setAll(false);
      navigationService.navigate('Tabs');
    } catch (err) {
      Alert.alert(i18nService.t('error'), i18n.t('errorMessage') + '\n' + i18n.t('tryAgain'))
    }
  }

  handleWizarRef = (ref) => {
    this.wizard = ref;
  }

  onNext = () => this.wizard.next();

  render() {
    const steps = [];
    if (!this.props.onboarding.progress) {
      return <CenteredLoading/>
    }
    const completed_items = [];//this.props.onboarding.progress.completed_items;

    if (!completed_items.some(r => r == 'creator_frequency')) {
      steps.push({component: <WelcomeStepNew onNext={this.onNext} onFinish={this.onFinish}/>, ready: () => false});
    }
    if (!completed_items.some(r => r == 'suggested_hashtags')) {
      steps.push({component: <HashtagsStepNew onNext={this.onNext}/>});
    }
    steps.push({component: <ChannelSetupStepNew ref={r => this.channelSetup = r} onNext={this.onNext}/>});
    if (!completed_items.some(r => r == 'suggested_channels')) {
      steps.push({component: <SuggestedChannelsStep/>});
    }
    if (!completed_items.some(r => r == 'suggested_groups')) {
      // steps.push({component: <SuggestedGroupsStep/>});
    }

    if (!completed_items.some(r => r == 'tokens_verification')) {
      steps.push({component: <RewardsStep onJoin={() => this.wizard.next()}/>});
    }

    return (
      <SafeAreaView style={[CS.flexContainer, CS.backgroundWhite]}>
        <KeyboardAvoidingView style={[CS.flexContainer]} behavior={ Platform.OS == 'ios' ? 'padding' : null }>
          <Wizard steps={steps} onFinish={this.onFinish} ref={this.handleWizarRef}></Wizard>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

// const style = StyleSheet.create(stylesheet);
