import React, { Component } from 'react';

import {
  View,
  Text
} from 'react-native';

import FastImage from 'react-native-fast-image';

import NewsfeedStore from "./NewsfeedStore";
import { getSingle } from './NewsfeedService';
import { CommonStyle as CS } from '../styles/Common';
import CommentList from '../comments/CommentList';
import Activity from '../newsfeed/activity/Activity';
import ActivityModel from '../newsfeed/ActivityModel';
import { ComponentsStyle } from '../styles/Components';
import SingleEntityStore from '../common/stores/SingleEntityStore';
import CenteredLoading from '../common/components/CenteredLoading';
import commentsStoreProvider from '../comments/CommentsStoreProvider';

/**
 * Activity screen
 */
export default class ActivityScreen extends Component {

  entityStore = new SingleEntityStore();

  state = {
    error: null
  };

  /**
   * Constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    const params = props.navigation.state.params;
    this.store = params.store ? params.store : new NewsfeedStore();
    this.comments = commentsStoreProvider.get();

    if (params.entity && (params.entity.guid || params.entity.entity_guid)) {
      this.entityStore.setEntity(ActivityModel.checkOrCreate(params.entity));

      let index = this.store.list.entities.findIndex(x => x.guid == this.entityStore.entity.guid);

      if (index === -1) {
        this.store.list.entities.push(this.entityStore.entity);
      }
    }
  }

  /**
   * Component did mount
   */
  async componentDidMount() {
    const params = this.props.navigation.state.params;

    if (!this.entityStore.entity || params.hydrate) {
      try {
        const resp = await getSingle(params.guid || params.entity.guid || params.entity.entity_guid);
        await this.entityStore.setEntity(ActivityModel.checkOrCreate(resp.activity));
      } catch (e) {
        this.setState({error: true});
        //console.error('Cannot hydrate activity', e);
      }
    }
  }

  /**
   * Get header
   */
  getHeader() {
    return this.entityStore.entity ?
      <Activity
        ref={o => this.activity = o}
        entity={ this.entityStore.entity }
        newsfeed={ this.store }
        navigation={ this.props.navigation }
        autoHeight={true}
      /> : null;
  }

  /**
   * On comment input focus
   */
  onFocus = () => {
    this.activity.pauseVideo();
  }

  /**
   * Render
   */
  render() {
    if (!this.entityStore.entity) return <CenteredLoading />;
    return (
      <View style={[CS.flexContainer, CS.backgroundWhite]}>
        {
          !this.state.error ?
            <CommentList
              header={this.getHeader()}
              entity={this.entityStore.entity}
              store={this.comments}
              navigation={this.props.navigation}
              onInputFocus={this.onFocus}
            />
          :
            <View style={CS.flexColumnCentered}>
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={ComponentsStyle.logo}
                source={require('../assets/logos/logo.png')}
              />
              <Text style={[CS.fontL, CS.colorDanger]}>SORRY, WE COULDN'T LOAD THE ACTIVITY</Text>
              <Text style={[CS.fontM]}>PLEASE TRY AGAIN LATER</Text>
            </View>
        }
      </View>
    );
  }
}