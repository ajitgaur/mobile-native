import React, { Component } from 'react';

import {
  observer,
  inject
} from 'mobx-react'

import { View } from 'react-native';

import { Icon } from 'react-native-elements'
import IonIcon from 'react-native-vector-icons/Ionicons';

import NewsfeedList from './NewsfeedList';
import CenteredLoading from '../common/components/CenteredLoading';
import BoostsCarousel from './boosts/BoostsCarousel';
import Topbar from './topbar/Topbar';
import CaptureFab from '../capture/CaptureFab';
import stores from '../../AppStores';
import { CommonStyle } from '../styles/Common';
import GroupsBar from '../groups/GroupsBar';
import FeedList from '../common/components/FeedList';
import featuresService from '../common/services/features.service';
import TabIcon from '../tabs/TabIcon';
import TopbarNew from '../topbar/TopbarNew';
import i18n from '../common/services/i18n.service';

/**
 * News Feed Screen
 */
export default
@inject('newsfeed', 'user', 'discovery', 'messengerList')
@observer
class NewsfeedScreen extends Component {
  /**
   * Nav to activity full screen
   */
  navToCapture = () => {
    this.props.navigation.navigate('Capture');
  };

  /**
   * Load data on mount
   */
  componentDidMount() {
    this.disposeTabPress = this.props.navigation.addListener('tabPress', e => {
      if (this.props.navigation.isFocused()) {
        if (stores.newsfeed.filter === 'subscribed') {
          stores.newsfeed.scrollToTop();
          stores.newsfeed.feedStore.refresh(true);
        } else {
          stores.newsfeed.refresh();
        }
        e.preventDefault();
      }
    });

    this.loadFeed();
    // this.props.newsfeed.loadBoosts();
  }

  async loadFeed() {

    this.props.discovery.init();

    await this.props.newsfeed.feedStore.fetchRemoteOrLocal();

    // load groups after the feed
    await this.groupsBar.initialLoad();
    // load discovery after the feed is loaded
    this.props.discovery.fetch();

    // load messenger
    this.props.messengerList.loadList();

    // listen socket on app start
    this.props.messengerList.listen();

  }

  /**
   * Component will unmount
   */
  componentWillUnmount() {
    this.props.messengerList.unlisten();
    if (this.disposeEnter) {
      this.disposeEnter();
    }
    if (this.disposeTabPress) {
      this.disposeTabPress();
    }
  }

  setGroupsBarRef = (r) => this.groupsBar = r;

  render() {
    const newsfeed = this.props.newsfeed;

    const header = (
      <View>
        <Topbar />
        <GroupsBar ref={this.setGroupsBarRef}/>
        { false ?
          <BoostsCarousel boosts={newsfeed.boosts} navigation={this.props.navigation} store={newsfeed} me={this.props.user.me}/>
          : null }
      </View>
    );

    let feed;
    if (newsfeed.filter == 'subscribed') {
      feed = <FeedList
        ref={newsfeed.setListRef}
        feedStore={newsfeed.feedStore}
        header={header}
        navigation={this.props.navigation}
      />;
    } else {
      feed = <NewsfeedList
        newsfeed={newsfeed}
        header={header}
        navigation={this.props.navigation}
      />;
    }

    return (
      <View style={CommonStyle.flexContainer} testID="NewsfeedScreen">
        <TopbarNew title={i18n.t('tabTitleNewsfeed')}/>
        { feed }
        {/* <CaptureFab navigation={this.props.navigation} route={this.props.route} testID="captureFab"/> */}
      </View>
    );
  }
}
