import api from './../common/services/api.service';


/**
 * Channel Service
 */
class ChannelService {

  /**
   * Load Channel
   * @param {string} guid
   */
  load(guid) {
    return api.get('api/v1/channel/' + guid);
  }

  /**
   * Subscribe to Channel
   * @param {string} guid
   */
  toggleSubscription(guid, value) {
    if (value) {
      return api.post('api/v1/subscribe/' + guid);
    } else {
      return api.delete('api/v1/subscribe/' + guid);
    }
  }

  /**
   * Block to Channel
   * @param {string} guid
   */
  toggleBlock(guid, value) {
    if (value) {
      return api.put('api/v1/block/' + guid);
    } else {
      return api.delete('api/v1/block/' + guid);
    }
  }

  getImageFeed(guid, offset) {
    return api.get('api/v1/entities/owner/image/' + guid, { offset: offset, limit: 9 })
    .then((data) => {
      return {
        entities: data.entities,
        offset: data['load-next'],
        }
      })
      .catch(err => {
        console.log('error');
        throw "Ooops";
      })
  }

  getVideoFeed(guid, offset) {
    return api.get('api/v1/entities/owner/video/' + guid, { offset: offset, limit: 6 })
    .then((data) => {
      return {
        entities: data.entities,
        offset: data['load-next'],
        }
      })
      .catch(err => {
        console.log('error');
        throw "Ooops";
      })
  }
}

export default new ChannelService();